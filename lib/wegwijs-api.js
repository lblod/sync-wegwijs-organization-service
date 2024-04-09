import { WEGWIJS_DATA_OBJECT_IDS } from "./wegwijs-object-data-ids.js";

export const ORGANIZATION_STATUS = {
  ACTIVE: "http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6",
  INACTIVE: "http://lblod.data.gift/concepts/d02c4e12bf88d2fdf5123b07f29c9311",
};

export const WEGWIJS_API =
  "https://api.wegwijs.vlaanderen.be/v1/search/organisations";
export const WEGWIJS_API_FIELDS =
  "changeTime,name,shortName,ovoNumber,kboNumber,labels,contacts,organisationClassifications,locations";

/**
 * Represents a Validty
 * @typedef {Object} Validity
 * @property {string} [start] - The start date of the validity
 * @property {string} [end] - The end date of the validity (optional)
 *
 * Represents a Label
 * @typedef {Object} Label
 * @property {string} organisationLabelId - The organisation label id
 * @property {string} labelTypeId - The label type id
 * @property {string} labelTypeName - The label type name
 * @property {string} value - The value of the label
 * @property {Validity} validity - The validity of the label
 *
 * Represents a Contact
 * @typedef {Object} Contact
 * @property {string} organisationContactId - The organisation contact id
 * @property {string} contactTypeId - The contact type id
 * @property {string} contactTypeName - The contact type name
 * @property {string} value - The value of the contact
 * @property {Validity} validity - The validity of the contact
 *
 * Represents an LocationComponent
 * @typedef {Object} LocationComponent
 * @property {string} street - The street of the location
 * @property {string} zipCode - The zip code of the location
 * @property {string} municipality - The municipality of the location
 * @property {string} country - The country of the location
 *
 * Represents an Location
 * @typedef {Object} Location
 * @property {string} organisationLocationId - The organisation location id
 * @property {string} locationTypeId - The location type id
 * @property {string} locationTypeName - The location type name
 * @property {string} locationId - The location id
 * @property {string} formattedAddress - The formatted address of the location
 * @property {LocationComponent} components - The components of the location
 * @property {boolean} isMainLocation - The main location of the location
 * @property {Validity} validity - The validity of the location
 *
 * Represents an OrganisationClassification
 * @typedef {Object} OrganisationClassification
 * @property {string} organisationOrganisationClassificationId
 * @property {string} organisationClassificationId - The organisation classification id
 * @property {string} organisationClassificationName - The organisation classification name
 * @property {string} organisationClassificationTypeId - The organisation classification type id
 * @property {string} organisationClassificationTypeName - The organisation classification type name
 * @property {Validity} validity - The validity of the organisation classification
 *
 * Represents wegwijs data response
 * @typedef {Object} WegwijsData
 * @property {string} changeTime - The change time of the data
 * @property {string} name - The name of the organisation
 * @property {string} shortName - The short name of the organisation
 * @property {string} ovoNumber - The ovo number of the organisation
 * @property {string} kboNumber - The kbo number of the organisation
 * @property {Array<Label>} labels - The labels of the organisation
 * @property {Array<Contact>} contacts - The contacts of the organisation
 * @property {Array<OrganisationClassification>} organisationClassifications - The organisation classifications of the organisation
 * @property {Array<Location>} locations - The locations of the organisation
 */

/**
 * Get the KBO fields from the wegwijs data
 * @param {WegwijsData} data - The wegwijs data
 */
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
  const activeState = validity && "end" in validity
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
 * @param {Array<Label>} labels - Array of labels
 */
export const extractFormalName = (labels) => {
  return findObjectByFieldValue(labels, WEGWIJS_DATA_OBJECT_IDS.LABELS)?.value;
};

/**
 * Extract the validity from the labels
 * @param {Array<Label>} labels - Array of labels
 */
export const extractValidity = (labels) => {
  return findObjectByFieldValue(labels, WEGWIJS_DATA_OBJECT_IDS.LABELS)
    ?.validity;
};

/**
 * Extract the email from the contacts
 * @param {Array<Contact>} contacts - Array of contacts fields
 */
export const extractEmail = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.EMAIL
  )?.value;
};

/**
 * Extract the phone from the contacts
 * @param {Array<Contact>} contacts - Array of contacts fields
 */
export const extractPhone = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.PHONE
  )?.value;
};

/**
 * Extract the website from the contacts
 * @param {Array<Contact>} contacts - Array of contacts fields
 */
export const extractWebsite = (contacts) => {
  return findObjectByFieldValue(
    contacts,
    WEGWIJS_DATA_OBJECT_IDS.CONTACTS.WEBSITE
  )?.value;
};

/**
 * Extract the address from the locations
 * @param {Array<Location>} locations - Array of locations fields
 */
export const extractAddress = (locations) => {
  return findObjectByFieldValue(locations, WEGWIJS_DATA_OBJECT_IDS.ADDRESS);
};

/**
 * Extract the rechtsvorm from the organisationClassifications
 * @param {Array<OrganisationClassification>} organisationClassifications - Array of organisationClassifications fields
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
 * @template T
 * @param {Array<T>} array
 * @param {Object} searchField - Object containing the field name and the value to search for in the array
 * @param {string} searchField.NAME - The name of the field to search for
 * @param {string} searchField.ID - The value to search for in the array
 */
export const findObjectByFieldValue = (array, { NAME, ID }) => {
  return array?.find((fields) => {
    return fields[NAME] === ID;
  });
};

/**
 * Check if the Wegwijs data is more recent than the ABB data
 * @param {string | undefined} wegwijsChangeTime
 * @param {string | undefined} abbChangeTime
 * @returns {Boolean} - True if the Wegwijs data is more recent than the ABB data 
 */
export const isUpdateNeeded = (wegwijsChangeTime, abbChangeTime) => {
  return wegwijsChangeTime && abbChangeTime ? new Date(wegwijsChangeTime) > new Date(abbChangeTime) : true;
}