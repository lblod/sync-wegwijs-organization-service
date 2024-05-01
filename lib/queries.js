import { uuid, sparqlEscapeUri, sparqlEscapeString } from "mu";
import { querySudo as query, updateSudo as update } from "@lblod/mu-auth-sudo";

const graphs = [
  "http://mu.semte.ch/graphs/administrative-unit",
  "http://mu.semte.ch/graphs/worship-service",
];
const graphValues = graphs.map((graph) => sparqlEscapeUri(graph)).join(" ");

/**
 * Represents the information of the ABB organization.
 * @typedef {object} AbbOrganizationInfo
 * @property {string} [kbo] The KBO number.
 * @property {string} [kboIdUri] The URI of the KBO identifier.
 * @property {string} [kboStructuredIdUri] The URI of the KBO structured identifier.
 * @property {string} [ovo] The OVO number.
 * @property {string} [ovoStructuredIdUri] The URI of the OVO structured identifier.
 * @property {string} [abbOrgUri] The URI of the ABB organization.
 *
 * Get the information of the ABB organization linked to the given KBO organization.
 * @param {string} kboStructuredIdUuid The UUID of the KBO structured identifier.
 * @returns {Promise<AbbOrganizationInfo | null>} The information of the ABB organization.
 */
export async function getAbbOrganizationInfo(kboStructuredIdUuid) {
  const queryStr = `
    SELECT DISTINCT ?kbo ?kboId ?kboStructuredId ?ovo ?ovoStructuredId ?organization WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {
        ?kboStructuredId a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
          <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
            kboStructuredIdUuid
          )} ;
          <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?kbo .

        ?kboId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?kboStructuredId ;
          <http://www.w3.org/2004/02/skos/core#notation> ?kboNotation .

        ?organization <http://www.w3.org/ns/adms#identifier> ?kboId .

        FILTER (?kboNotation IN ("KBO nummer"@nl, "KBO nummer"))
        FILTER (!regex(?organization, "kboOrganisaties","i"))

        OPTIONAL {
          ?organization <http://www.w3.org/ns/adms#identifier> ?ovoId .

          ?ovoId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?ovoStructuredId ;
            <http://www.w3.org/2004/02/skos/core#notation> ?ovoNotation .

          OPTIONAL { ?ovoStructuredId <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo . }
          
          FILTER (?ovoNotation IN ("OVO-nummer"@nl, "OVO-nummer"))
        }
      }
    }
  `;

  const { results } = await query(queryStr);

  if (results.bindings.length) {
    const binding = results.bindings[0]; // We should only have one KBO/OVO couple
    return {
      kbo: binding.kbo?.value,
      kboIdUri: binding.kboId?.value,
      kboStructuredIdUri: binding.kboStructuredId?.value,
      ovo: binding.ovo?.value,
      ovoStructuredIdUri: binding.ovoStructuredId?.value,
      abbOrgUri: binding.organization?.value,
    };
  }

  return null;
}

/**
 * Represents the information of the KBO organization.
 * @typedef {object} KboOrganizationInfo
 * @property {string} [kboOrgUri] The URI of the KBO organization.
 * @property {string} [abbOrgUri] The URI of the ABB organization.
 * @property {string} [modified] The change time in wegwijs.
 * @property {string} [contactPointUri] The URI of the contact point.
 * @property {string} [addressUri] The URI of the address.
 *
 * Get the information of the KBO organization linked to the given ABB organization.
 * @param {string} abbOrganization The URI of the ABB organization.
 * @returns {Promise<KboOrganizationInfo | null>} The information of the KBO organization.
 */
export async function getKboOrganizationInfo(abbOrganization) {
  const queryStr = `
    SELECT DISTINCT ?kboOrg ?abbOrg ?modified ?contactPointUri ?addressUri WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {
        ?kboOrg a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
          <http://www.w3.org/2002/07/owl#sameAs> ?abbOrg ;
          <http://purl.org/dc/terms/modified> ?modified .

        OPTIONAL {
          ?kboOrg <http://schema.org/contactPoint> ?contactPointUri .

          OPTIONAL {
            ?contactPointUri <http://www.w3.org/ns/locn#address> ?addressUri .
          }
        }

        FILTER(?abbOrg = ${sparqlEscapeUri(abbOrganization)})
      }
    }
  `;

  const { results } = await query(queryStr);

  if (results.bindings.length) {
    const binding = results.bindings[0];
    return {
      kboOrgUri: binding.kboOrg?.value,
      abbOrgUri: binding.abbOrg?.value,
      modified: binding.modified?.value,
      contactPointUri: binding.contactPointUri?.value,
      addressUri: binding.addressUri?.value,
    };
  }

  return null;
}

/**
 * Create a new OVO structured identifier for the given KBO structured identifier.
 * @param {string} abbOrgUri The URI of the ABB organization.
 * @param {string} kboStructuredId The URI of the KBO structured identifier.
 * @returns {Promise<string>} The URI of the new OVO structured identifier.
 */
export async function createOvoStructure(abbOrgUri, kboStructuredId) {
  const idUuid = uuid();
  const idUri = `http://data.lblod.info/id/identificatoren/${idUuid}`;
  const structuredIdUuid = uuid();
  const structuredIdUri = `http://data.lblod.info/id/gestructureerdeIdentificatoren/${structuredIdUuid}`;

  const updateStr = `
    INSERT {
      GRAPH ?g {
        ?abbOrg <http://www.w3.org/ns/adms#identifier> ${sparqlEscapeUri(
          idUri
        )} .

        ${sparqlEscapeUri(idUri)} a <http://www.w3.org/ns/adms#Identifier> ;
          <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
            idUuid
          )} ;
          <http://www.w3.org/2004/02/skos/core#notation> "OVO-nummer" ;
          <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ${sparqlEscapeUri(
            structuredIdUri
          )} .

        ${sparqlEscapeUri(
          structuredIdUri
        )} a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
          <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
            structuredIdUuid
          )} .
      }
    } WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {
        ${sparqlEscapeUri(
          kboStructuredId
        )} a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
          <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?kbo .

        ?kboId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ${sparqlEscapeUri(
          kboStructuredId
        )} ;
          <http://www.w3.org/2004/02/skos/core#notation> ?notation .

        ?abbOrg <http://www.w3.org/ns/adms#identifier> ?kboId .

        FILTER (?notation IN ("KBO nummer"@nl, "KBO nummer"))
        FILTER(?abbOrg = ${sparqlEscapeUri(abbOrgUri)})
      }
    }
  `;

  await update(updateStr);

  return structuredIdUri;
}

export async function updateOvoNumberAndUri(
  abbOrgUri,
  ovoStructuredIdUri,
  wegwijsOvo
) {
  let updateStr = `
    DELETE {
      GRAPH ?g {
        ?abbOrg <http://www.w3.org/2002/07/owl#sameAs> ?ovoUri .
        ${sparqlEscapeUri(
          ovoStructuredIdUri
        )} <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo .
      }
    }
  `;

  if (wegwijsOvo) {
    updateStr += `
      INSERT {
        GRAPH ?g {
          ?abbOrg <http://www.w3.org/2002/07/owl#sameAs> ${sparqlEscapeUri(
            `http://data.vlaanderen.be/id/organisatie/${wegwijsOvo}`
          )} .
          ${sparqlEscapeUri(
            ovoStructuredIdUri
          )} <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ${sparqlEscapeString(
      wegwijsOvo
    )} .
        }
      }
    `;
  }

  updateStr += `
    WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {

        ${sparqlEscapeUri(
          ovoStructuredIdUri
        )} a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> .

        OPTIONAL {
          ?abbOrg <http://www.w3.org/ns/adms#identifier>/<https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ${sparqlEscapeUri(
            ovoStructuredIdUri
          )} ;
          <http://www.w3.org/2002/07/owl#sameAs> ?ovoUri .
        }

        OPTIONAL { ${sparqlEscapeUri(
          ovoStructuredIdUri
        )} <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo . }

        FILTER(?abbOrg = ${sparqlEscapeUri(abbOrgUri)})
      }
    }
  `;

  await update(updateStr);
}

/**
 * Represents the fields of the KBO organization.
 * @typedef {object} AbbOrganizationDetails
 * @property {string} kbo The KBO number.
 * @property {string} kboStructuredIdUri The URI of the KBO structured identifier.
 * @property {string} kboIdUri The URI of the KBO identifier.
 * @property {string} ovo The OVO number.
 * @property {string} ovoStructuredIdUri The URI of the OVO structured identifier.
 * @property {string} abbOrgUri The URI of the ABB organization.
 * @property {string} kboOrgUri The URI of the KBO organization.
 * @property {string} kboOrgModified The time of the last change.
 *
 * Get all the ABB organizations with KBO numbers.
 * @returns {Promise<AbbOrganizationInfo[]>} The information of the ABB organizations.
 */
export async function getAllAbbKboOrganizations() {
  let queryStr = `
   SELECT ?kbo ?ovo ?kboStructuredId ?ovoStructuredId ?abbOrg ?kboOrg ?kboId ?kboOrgModified WHERE {
       VALUES ?g { ${graphValues} }
       GRAPH ?g {
         ?kboId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?kboStructuredId ;
               <http://www.w3.org/2004/02/skos/core#notation> ?kboNotation .
     
         ?kboStructuredId a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
               <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?kbo .
     
         ?abbOrg <http://www.w3.org/ns/adms#identifier> ?kboId .
     
         FILTER (?kboNotation IN ("KBO nummer"@nl, "KBO nummer"))
         FILTER (!regex(?abbOrg, "kboOrganisaties","i"))
     
         OPTIONAL{
          ?kboOrg a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
              <http://www.w3.org/2002/07/owl#sameAs> ?abbOrg ;
              <http://purl.org/dc/terms/modified> ?kboOrgModified .
         }
         OPTIONAL{
          ?abbOrg <http://www.w3.org/ns/adms#identifier> ?ovoId .
 
          ?ovoId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?ovoStructuredId ;
            <http://www.w3.org/2004/02/skos/core#notation> ?ovoNotation .

          OPTIONAL { ?ovoStructuredId <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo . }

          FILTER (?ovoNotation IN ("OVO-nummer"@nl, "OVO-nummer"))
        }
       }
     } GROUP BY ?abbOrg
   `;

  const { results } = await query(queryStr);

  if (results.bindings.length) {
    return results.bindings.map((binding) => {
      return {
        kbo: binding.kbo?.value,
        kboStructuredIdUri: binding.kboStructuredId.value,
        kboIdUri: binding.kboId?.value,
        ovo: binding.ovo?.value,
        ovoStructuredIdUri: binding.ovoStructuredId?.value,
        abbOrgUri: binding.abbOrg?.value,
        kboOrgUri: binding.kboOrg?.value,
        kboOrgModified: binding.kboOrgModified?.value,
      };
    });
  }

  return [];
}

/**
 * Build the query to create a new address for the KBO organization.
 * @param {string} addressUri The URI of the address.
 * @param {string} addressUuid The UUID of the address.
 * @param {string} formattedAddress The formatted address.
 * @returns {string} The query to create a new address.
 */
export const buildKboAddressQuery = (
  addressUri,
  addressUuid,
  formattedAddress
) => {
  let addressStr = `${sparqlEscapeUri(
    addressUri
  )} a <http://www.w3.org/ns/locn#Address> ;
    <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
      addressUuid
    )} ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> `;

  if (formattedAddress) {
    addressStr += `;
       <http://www.w3.org/ns/locn#fullAddress> ${sparqlEscapeString(
         formattedAddress
       )}`;
  }

  return `${addressStr} .`;
};

/**
 * Build the query to create a new contact point for the KBO organization.
 * @param {string} contactPointUri The URI of the contact point.
 * @param {string} contactPointUuid The UUID of the contact point.
 * @param {string} addressUri The URI of the address.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 * @returns {string} The query to create a new contact point.
 */
export const buildContactPointQuery = (
  contactPointUri,
  contactPointUuid,
  addressUri,
  kboFields
) => {
  let contactPointStr = `${sparqlEscapeUri(
    contactPointUri
  )} a <http://schema.org/ContactPoint> ;
    <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
      contactPointUuid
    )} ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://schema.org/contactType> ${sparqlEscapeString("Primary")} ;
    <http://www.w3.org/ns/locn#address> ${sparqlEscapeUri(addressUri)} `;

  if (kboFields.email) {
    contactPointStr += `; 
    <http://schema.org/email> ${sparqlEscapeString(kboFields.email)} `;
  }

  if (kboFields.phone) {
    contactPointStr += `; 
    <http://schema.org/telephone> ${sparqlEscapeString(kboFields.phone)} `;
  }

  if (kboFields.website) {
    contactPointStr += `; 
    <http://xmlns.com/foaf/0.1/page> ${sparqlEscapeString(kboFields.website)} `;
  }

  return `${contactPointStr} .`;
};

/**
 * Build the query to create a new KBO organization.
 * @param {string} kboOrgUri The URI of the KBO organization.
 * @param {string} kboOrgUuid The UUID of the KBO organization.
 * @param {string} kboIdentifierUri The KBO identifier URI.
 * @param {string} contactPointUri The URI of the contact point.
 * @param {string} abbOrgUri The ABB organization URI.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 * @returns {string} The query to create a new KBO organization.
 */
export const buildKboOrgQuery = (
  kboOrgUri,
  kboOrgUuid,
  kboIdentifierUri,
  contactPointUri,
  abbOrgUri,
  kboFields
) => {
  let kboOrgStr = `${sparqlEscapeUri(
    kboOrgUri
  )} a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
    <http://mu.semte.ch/vocabularies/core/uuid> ${sparqlEscapeString(
      kboOrgUuid
    )} ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://www.w3.org/2002/07/owl#sameAs> ${sparqlEscapeUri(abbOrgUri)} ;
    <http://schema.org/contactPoint> ${sparqlEscapeUri(contactPointUri)} `;

  if (kboIdentifierUri) {
    kboOrgStr += `; <http://www.w3.org/ns/adms#identifier> ${sparqlEscapeUri(
      kboIdentifierUri
    )} `;
  }
  if (kboFields.rechtsvorm) {
    kboOrgStr += `; <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ${sparqlEscapeString(
      kboFields.rechtsvorm
    )} `;
  }
  if (kboFields.startDate) {
    kboOrgStr += `; <http://mu.semte.ch/vocabularies/ext/startDate> ${sparqlEscapeString(
      kboFields.startDate
    )} `;
  }
  if (kboFields.formalName) {
    kboOrgStr += `; <http://www.w3.org/ns/regorg#legalName> ${sparqlEscapeString(
      kboFields.formalName
    )} `;
  }
  if (kboFields.shortName) {
    kboOrgStr += `; <http://www.w3.org/2004/02/skos/core#altLabel> ${sparqlEscapeString(
      kboFields.shortName
    )} `;
  }
  if (kboFields.changeTime) {
    kboOrgStr += `; <http://purl.org/dc/terms/modified> ${sparqlEscapeString(
      kboFields.changeTime
    )} `;
  }
  if (kboFields.activeState) {
    kboOrgStr += `; <http://www.w3.org/ns/regorg#orgStatus> ${sparqlEscapeUri(
      kboFields.activeState
    )} `;
  }

  return `${kboOrgStr} .`;
};

/**
 * Create a new KBO organization and its related address and contact point.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 * @param {string} kboIdentifierUri The KBO identifier URI.
 * @param {string} abbOrgUri The ABB organization URI.
 * @returns {Promise<string>} The URI of the new KBO organization.
 */
export const createKboOrg = async (kboFields, kboIdentifierUri, abbOrgUri) => {
  const addressUuid = uuid();
  const addressUri = `http://data.lblod.info/id/adressen/${addressUuid}`;
  const addressQuery = buildKboAddressQuery(
    addressUri,
    addressUuid,
    kboFields.formattedAddress
  );

  const contactPointUuid = uuid();
  const contactPointUri = `http://data.lblod.info/id/contact-punten/${contactPointUuid}`;
  const contactPointQuery = buildContactPointQuery(
    contactPointUri,
    contactPointUuid,
    addressUri,
    kboFields
  );

  const kboOrgUuid = uuid();
  const kboOrgUri = `http://data.lblod.info/id/kboOrganisaties/${kboOrgUuid}`;
  const kboOrgQuery = buildKboOrgQuery(
    kboOrgUri,
    kboOrgUuid,
    kboIdentifierUri,
    contactPointUri,
    abbOrgUri,
    kboFields
  );

  let updateStr = `
  INSERT {
    GRAPH ?g {
        ${addressQuery}

        ${contactPointQuery}

        ${kboOrgQuery}
      }
  } WHERE {
    VALUES ?g { ${graphValues} }
    GRAPH ?g {
      ?organization <http://www.w3.org/ns/adms#identifier> ${sparqlEscapeUri(
        kboIdentifierUri
      )} 
    }
  }   
  `;

  await update(updateStr);

  return kboOrgUri;
};

/**
 * Build the query to update a predicate, deleting the old value and inserting the new one if exist.
 * @param {string} subject The subject of the triple.
 * @param {string} type The type of the subject.
 * @param {string} predicate The predicate of the triple.
 * @param {string} value The new object of the triple.
 * @param {string} graphValues The values of the graph.
 * @returns {string} The query to update the predicate.
 */
export const buildUpdateQuery = (
  subject,
  type,
  predicate,
  value,
  graphValues
) => {
  const escapedSubject = sparqlEscapeUri(subject);
  const escapedPredicate = sparqlEscapeUri(predicate);

  const deleteQuery = `
    DELETE {
      GRAPH ?g {
        ?s ${escapedPredicate} ?o .
      }
    }
    WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {
        ?s a ${sparqlEscapeUri(type)} ;
          ${escapedPredicate} ?o .
        BIND(${escapedSubject} as ?s)
      }
    }`;

  const insertQuery = value
    ? `;
    INSERT {
      GRAPH ?g { 
        ?s ${escapedPredicate} ${sparqlEscapeString(value)} .
      }
    }
    WHERE {
      VALUES ?g { ${graphValues} }
      GRAPH ?g {
        ?s a ${sparqlEscapeUri(type)} .
        BIND(${escapedSubject} as ?s)
      }
    }`
    : "";

  return `${deleteQuery} ${insertQuery}`;
};

/**
 * Update the address of the KBO organization.
 * @param {string} addressUri The URI of the address.
 * @param {string} [formattedAddress] The formatted address.
 * @returns {Promise<void>} The promise that resolves when the update is done.
 */
const updateKboAddress = async (addressUri, formattedAddress) => {
  const query = buildUpdateQuery(
    addressUri,
    "http://www.w3.org/ns/locn#Address",
    "http://www.w3.org/ns/locn#fullAddress",
    formattedAddress,
    graphValues
  );

  await update(query);
};

/**
 * Update the contact point of the KBO organization.
 * @param {string} contactPointUri The URI of the contact point.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 * @returns {Promise<void>} The promise that resolves when the update is done.
 */
const updateKboContactPoint = async (contactPointUri, kboFields) => {
  const updateEmailQuery = buildUpdateQuery(
    contactPointUri,
    "http://schema.org/ContactPoint",
    "http://schema.org/email",
    kboFields.email,
    graphValues
  );

  const updatePhoneQuery = buildUpdateQuery(
    contactPointUri,
    "http://schema.org/ContactPoint",
    "http://schema.org/telephone",
    kboFields.phone,
    graphValues
  );

  const updateWebsiteQuery = buildUpdateQuery(
    contactPointUri,
    "http://schema.org/ContactPoint",
    "http://xmlns.com/foaf/0.1/page",
    kboFields.website,
    graphValues
  );

  const query = `
    ${updateEmailQuery}
    ;
    ${updatePhoneQuery}
    ;
    ${updateWebsiteQuery}
  `;

  await update(query);
};

/**
 * Update the KBO organization with the new information.
 * @param {string} kboOrgUri The URI of the KBO organization.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 */
const updateKboOrganization = async (kboOrgUri, kboFields) => {
  const updateRechtsvormQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://mu.semte.ch/vocabularies/ext/rechtsvorm",
    kboFields.rechtsvorm,
    graphValues
  );

  const updateShortNameQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://www.w3.org/2004/02/skos/core#altLabel",
    kboFields.shortName,
    graphValues
  );

  const updateStartDateQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://mu.semte.ch/vocabularies/ext/startDate",
    kboFields.startDate,
    graphValues
  );

  const updateFormalNameQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://www.w3.org/ns/regorg#legalName",
    kboFields.formalName,
    graphValues
  );

  const updateModifiedQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://purl.org/dc/terms/modified",
    kboFields.changeTime,
    graphValues
  );

  const updateActiveStateQuery = buildUpdateQuery(
    kboOrgUri,
    "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
    "http://www.w3.org/ns/regorg#orgStatus",
    kboFields.activeState,
    graphValues
  );

  const query = `
    ${updateRechtsvormQuery}
    ;
    ${updateShortNameQuery}
    ;
    ${updateStartDateQuery}
    ;
    ${updateFormalNameQuery}
    ;
    ${updateModifiedQuery}
    ;
    ${updateActiveStateQuery}
  `;

  await update(query);
};

/**
 * Update the KBO organization with the new information.
 * @param {import('../typedefs').KboFields} kboFields The fields of the KBO organization.
 * @param {KboOrganizationInfo} kboOrganizationInfo The information of the KBO organization.
 */
export const updateKboOrg = async (kboFields, kboOrganizationInfo) => {
  await updateKboAddress(
    kboOrganizationInfo.addressUri,
    kboFields?.formattedAddress
  );
  await updateKboContactPoint(kboOrganizationInfo.contactPointUri, kboFields);
  await updateKboOrganization(kboOrganizationInfo.kboOrgUri, kboFields);
};

// Update queries: via mu-auth if it comes from the frontend ?
