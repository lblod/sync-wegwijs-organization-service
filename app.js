import { app, errorHandler } from "mu";
import fetch from "node-fetch";
import { CronJob } from "cron";
import {
  getAbbOrganizationInfo,
  constructOvoStructure,
  updateOvoNumberAndUri,
  createKboOrg,
  getKboOrganizationInfo,
  updateKboOrg,
  getAllAbbKboOrganizations,
} from "./lib/queries";
import { CRON_PATTERN } from "./config";
import { API_STATUS_CODES } from "./api-error-handler";
import { getKboFields, isUpdateNeeded } from "./lib/wegwijs-api";

const WEGWIJS_SEARCH_ORGANIZATION_API =
  "https://api.wegwijs.vlaanderen.be/v1/search/organisations";
const WEGWIJS_API_FIELDS =
  "changeTime,name,shortName,ovoNumber,kboNumber,labels,contacts,organisationClassifications,locations";

app.post("/sync-kbo-data/:kboStructuredIdUuid", async function (req, res) {
  try {
    const abbOrganizationInfo = await getAbbOrganizationInfo(
      req.params.kboStructuredIdUuid
    );

    if (!abbOrganizationInfo?.kbo) {
      return setServerStatus(API_STATUS_CODES.STATUS_NO_DATA_OP, res);
    }

    const kboFields = await getWegwijsOrganisation(
      abbOrganizationInfo.kbo
    );

    if (!kboFields) {
      return setServerStatus(API_STATUS_CODES.ERROR_NO_DATA_WEGWIJS, res);
    }

    const kboOrganizationInfo = await getKboOrganizationInfo(
      abbOrganizationInfo.abbOrgUri
    );

    const isCreateNeeded = !kboOrganizationInfo && kboFields;
    if (isCreateNeeded) {
      await createKboOrg(
        kboFields,
        abbOrganizationInfo.kboId,
        abbOrganizationInfo.abbOrgUri
      );
    } else if (
      kboOrganizationInfo &&
      isUpdateNeeded(kboFields?.changeTime, kboOrganizationInfo.modified)
    ) {
      await updateKboOrg(kboFields, kboOrganizationInfo);
    }

    const wegwijsOvo = kboFields.ovoNumber;

    //Update Ovo Number
    if (wegwijsOvo && wegwijsOvo != abbOrganizationInfo.ovo) {
      let ovoStructuredIdUri = abbOrganizationInfo.ovoStructuredIdUri;

      if (!ovoStructuredIdUri) {
        ovoStructuredIdUri = await constructOvoStructure(
          abbOrganizationInfo.kboStructuredId
        );
      }
      await updateOvoNumberAndUri(ovoStructuredIdUri, wegwijsOvo);
    }

    return setServerStatus(API_STATUS_CODES.OK, res); // since we await, it should be 200
  } catch (e) {
    return setServerStatus(API_STATUS_CODES.CUSTOM_SERVER_ERROR, res, e);
  }
});

new CronJob(
  CRON_PATTERN,
  async function () {
    const now = new Date().toISOString();
    console.log(`Wegwijs data healing triggered by cron job at ${now}`);
    try {
      await healAbbWithWegWijsData();
    } catch (err) {
      console.log(
        `An error occurred during wegwijs data healing at ${now}: ${err}`
      );
    }
  },
  null,
  true
);
/**
 * Heal the ABB organizations with Wegwijs data
 */
async function healAbbWithWegWijsData() {
  try {
    console.log("Healing wegwijs info starting...");
    const kboIdentifiersOP = await getAllAbbKboOrganizations();
    const allWegwijsOrganisations = await getAllWegwijsOrganisations();

    for (const kboIdentifierOP of kboIdentifiersOP) {
      const wegwijsKboOrg = allWegwijsOrganisations[kboIdentifierOP.kbo];
      if (wegwijsKboOrg) {
        const wegwijsOvo = wegwijsKboOrg.ovoNumber;
        // If a KBO can't be found in wegwijs but we already have an OVO for it in OP, we keep that OVO.
        // It happens especially a lot for worship services that sometimes lack data in Wegwijs

        if (wegwijsOvo && kboIdentifierOP.ovo != wegwijsOvo) {
          // We have a mismatch, let's update the OVO number
          let ovoStructuredIdUri = kboIdentifierOP.ovoStructuredId;

          console.log(ovoStructuredIdUri);

          if (!ovoStructuredIdUri) {
            ovoStructuredIdUri = await constructOvoStructure(
              kboIdentifierOP.kboStructuredId
            );
          }

          await updateOvoNumberAndUri(ovoStructuredIdUri, wegwijsOvo);
        }

        if (!kboIdentifierOP?.kboOrg) {
          await createKboOrg(
            wegwijsKboOrg,
            kboIdentifierOP.kboId,
            kboIdentifierOP.abbOrg
          );
        }

        if (
          isUpdateNeeded(wegwijsKboOrg?.changeTime, kboIdentifierOP?.changeTime)
        ) {
          const kboIdentifiers = await getKboOrganizationInfo(
            kboIdentifierOP.abbOrg
          );
          await updateKboOrg(wegwijsKboOrg, kboIdentifiers);
        }
      }
    }
    console.log("Healing complete!");
  } catch (err) {
    console.log(`An error occurred during wegwijs info healing: ${err}`);
  }
}

/**
 * Get the organisation from Wegwijs
 * @param {string} kboNumber - The KBO number
 * @returns {Promise<import('./typedefs.js').KboFields>} - The KBO fields
 */
const getWegwijsOrganisation = async (kboNumber) => {
  const url = `${WEGWIJS_SEARCH_ORGANIZATION_API}?q=kboNumber:${kboNumber}&fields=${WEGWIJS_API_FIELDS}`;
  console.log("url: " + url);

  const response = await fetch(url);
  const data = await response.json();

  return data.length ? getKboFields(data[0]) : null;
};

/**
 * Get all organisations from Wegwijs
 * @typedef {{[key: string]: import('./typedefs.js').KboFields}} Organisations
 * @returns {Promise<Organisations>} - Object containing all organisations from Wegwijs indexed by KBO number
 */
const getAllWegwijsOrganisations = async () => {
  let organisations = {};

  const response = await fetch(
    `${WEGWIJS_SEARCH_ORGANIZATION_API}?q=kboNumber:/.*[0-9].*/&fields=${WEGWIJS_API_FIELDS},parents&scroll=true`
  );
  const scrollId = JSON.parse(
    response.headers.get("x-search-metadata")
  ).scrollId;
  let data = await response.json();

  do {
    data.forEach((organisation) => {
      const kboFields = getKboFields(organisation);
      organisations[kboFields.kboNumber] = kboFields;
    });

    const response = await fetch(
      `${WEGWIJS_SEARCH_ORGANIZATION_API}/scroll?id=${scrollId}`
    );
    data = await response.json();
  } while (data.length);

  return organisations;
};

function setServerStatus(statusCode, res, message) {
  if (statusCode.CODE === 500) {
    console.log("Something went wrong while calling /sync-from-kbo", message);
  }
  return res.status(statusCode.CODE).send(statusCode.STATUS);
}

app.use(errorHandler);
