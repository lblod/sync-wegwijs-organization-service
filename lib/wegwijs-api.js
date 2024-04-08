import { WEGWIJS_DATA_OBJECT_IDS } from "./wegwijs-object-data-ids.js";

export const ORGANIZATION_STATUS = {
  ACTIVE: "http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6",
  INACTIVE: "http://lblod.data.gift/concepts/d02c4e12bf88d2fdf5123b07f29c9311",
};

export const WEGWIJS_API = "https://api.wegwijs.vlaanderen.be/v1/search/organisations";
export const WEGWIJS_API_FIELDS =
  "changeTime,name,shortName,ovoNumber,kboNumber,labels,contacts,organisationClassifications,locations";

export function getKboFields(data) {
  const {
    changeTime,
    shortName,
    ovoNumber,
    kboNumber,
    labels = [],
    contacts = [],
    organisationClassifications = [],
    locations = [],
  } = data;

  const formalName = extractFormalName(labels);
  const validity = extractValidity(labels);
  const startDate = validity?.start;
  const activeState = validity?.hasOwnProperty("end")
    ? ORGANIZATION_STATUS.INACTIVE
    : ORGANIZATION_STATUS.ACTIVE;

  const email = extractEmail(contacts);
  const phone = extractPhone(contacts);
  const website = extractWebsite(contacts);

  const address = extractAddress(locations);
  const formattedAddress = address?.formattedAddress;
  const adressComponent = address?.components;

  const rechtsvorm = extractRechtsvorm(organisationClassifications);

  return {
    changeTime,
    shortName,
    ovoNumber,
    kboNumber,
    formalName,
    startDate,
    activeState,
    rechtsvorm,
    email,
    phone,
    website,
    formattedAddress,
    adressComponent,
  };
}

/**
 * Extract the formal name from the labels
 * @param {Array} labels - Array of labels
 * @returns {string | undefined} - The first formal name of the organization or undefined if not found
 */
export const extractFormalName = (labels) => {
  return findObjectByFieldValue(labels, WEGWIJS_DATA_OBJECT_IDS.LABELS)?.value;
};

/**
 * Extract the validity from the labels
 * @param {Array} labels - Array of labels
 * @returns {Object | undefined} - The validity of the organization or undefined if not found
 */
export const extractValidity = (labels) => {
  return findObjectByFieldValue(labels, WEGWIJS_DATA_OBJECT_IDS.LABELS)
    ?.validity;
};

/**
 * Extract the email from the contacts
 * @param {Array} contacts - Array of contacts fields
 * @returns {string | undefined} - The first email found in contacts or undefined if not found
 */
export const extractEmail = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.EMAIL
  )?.value;
};

/**
 * Extract the phone from the contacts
 * @param {Array} contacts - Array of contacts fields
 * @returns {string | undefined} - The first phone found in contacts or undefined if not found
 */
export const extractPhone = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.PHONE
  )?.value;
};

/**
 * Extract the website from the contacts
 * @param {Array} contacts - Array of contacts fields
 * @returns {string | undefined} - The first website found in contacts or undefined if not found
 */
export const extractWebsite = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.WEBSITE
  )?.value;
};

/**
 * Extract the address from the locations
 * @param {Array} locations - Array of locations fields
 * @returns {Object | undefined} - The first address found in locations or undefined if not found
 */
export const extractAddress = (locations) => {
  return findObjectByFieldValue(locations, WEGWIJS_DATA_OBJECT_IDS.ADDRESS);
};

/**
 * Extract the rechtsvorm from the organisationClassifications
 * @param {Array} organisationClassifications - Array of organisationClassifications fields
 * @returns {string | undefined} - The first rechtsvorm found in organisationClassifications or undefined if not found
 */
export const extractRechtsvorm = (organisationClassifications) => {
  return organisationClassifications?.find((fields) => {
    return WEGWIJS_DATA_OBJECT_IDS.RECHTSVORM.IDS.includes(
      fields[WEGWIJS_DATA_OBJECT_IDS.RECHTSVORM.NAME]
    );
  })?.organisationClassificationName;
};

/**
 * Find an object in an array by a field value
 * @param {Array} array
 * @param {Object} searchField - Object containing the field name and the value to search for in the array
 * @returns {Object | undefined} - The object found in the array or undefined if not found
 */
export const findObjectByFieldValue = (array, { NAME, ID }) => {
  return array?.find((fields) => {
    return fields[NAME] === ID;
  });
};
