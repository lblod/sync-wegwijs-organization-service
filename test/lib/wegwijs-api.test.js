import assert from "assert";

import {
  labels,
  contacts,
  locations,
  organisationClassifications,
  fullResponse,
} from "./wegwijs-api.data.js";
import {
  getKboFields,
  extractFormalName,
  extractValidity,
  extractEmail,
  extractPhone,
  extractWebsite,
  extractAddress,
  extractRechtsvorm,
  findObjectByFieldValue,
} from "../../lib/wegwijs-api.js";

describe("Wegwijs API", () => {
  describe("getKboFields", () => {
    it("should return the KBO fields", () => {
      const result = getKboFields(fullResponse);
      assert.deepStrictEqual(result, {
        changeTime: "2023-11-15",
        shortName: "Aalst",
        ovoNumber: "OVO001992",
        kboNumber: "0207437468",
        formalName: "Stad Aalst",
        startDate: "1968-01-01",
        activeState:
          "http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6",
        rechtsvorm: "Stad/Gemeente",
        email: "info@aalst.be",
        phone: "053 77 93 00",
        website: "https://www.aalst.be",
        formattedAddress: "Werf 9, 9300 Aalst, België",
        adressComponent: {
          street: "Werf 9",
          zipCode: "9300",
          municipality: "Aalst",
          country: "België",
        },
      });
    });

    it("should return the KBO fields with activeState INACTIVE", () => {
      const result = getKboFields({
        labels: [
          {
            organisationLabelId: "2232eaa3-469e-406b-8b6f-f82c6b09c6f7",
            labelTypeId: "83c1c22a-6776-0ad6-68d2-819e1c6eec66",
            labelTypeName: "Formele naam volgens KBO",
            value: "Stad Aalst",
            validity: {
              start: "1968-01-01",
              end: "2023-11-15",
            },
          },
        ],
      });
      assert.strictEqual(
        result.activeState,
        "http://lblod.data.gift/concepts/d02c4e12bf88d2fdf5123b07f29c9311"
      );
    });

    it("should return default values when no data is provided", () => {
      const result = getKboFields({});
      assert.deepStrictEqual(result, {
        changeTime: undefined,
        shortName: undefined,
        ovoNumber: undefined,
        kboNumber: undefined,
        formalName: undefined,
        startDate: undefined,
        activeState:
          "http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6",
        rechtsvorm: undefined,
        email: undefined,
        phone: undefined,
        website: undefined,
        formattedAddress: undefined,
        adressComponent: undefined,
      });
    });
  });

  describe("extractFormalName", () => {
    it("should return the formal name according to KBO", () => {
      const result = extractFormalName(labels);
      assert.strictEqual(result, "Stad Aalst");
    });
  });

  describe("extractStartDate", () => {
    it("should return the start date", () => {
      const result = extractValidity(labels);
      assert.deepStrictEqual(result, {
        start: "1968-01-01",
      });
    });
  });

  describe("extractEmail", () => {
    it("should return the email address", () => {
      const result = extractEmail(contacts);
      assert.strictEqual(result, "info@aalst.be");
    });
  });

  describe("extractPhone", () => {
    it("should return the phone number", () => {
      const result = extractPhone(contacts);
      assert.strictEqual(result, "053 77 93 00");
    });
  });

  describe("extractWebsite", () => {
    it("should return the website", () => {
      const result = extractWebsite(contacts);
      assert.strictEqual(result, "https://www.aalst.be");
    });
  });

  describe("extractAddress", () => {
    it("should return the address", () => {
      const result = extractAddress(locations);
      assert.strictEqual(result.formattedAddress, "Werf 9, 9300 Aalst, België");
      assert.deepStrictEqual(result.components, {
        street: "Werf 9",
        zipCode: "9300",
        municipality: "Aalst",
        country: "België",
      });
    });
  });

  describe("extractRechtsvorm", () => {
    it("should return the rechtsvorm", () => {
      const result = extractRechtsvorm(organisationClassifications);
      assert.strictEqual(result, "Stad/Gemeente");
    });
  });

  describe("findObjectByFieldValue", () => {
    it("should return the object with the specified key/value", () => {
      const array = [
        {
          key1: "value1",
          key2: "value2",
        },
        {
          key1: "value3",
          key2: "value4",
        },
      ];
      const result = findObjectByFieldValue(array, {
        NAME: "key1",
        ID: "value3",
      });
      assert.deepStrictEqual(result, { key1: "value3", key2: "value4" });
    });
  });
});
