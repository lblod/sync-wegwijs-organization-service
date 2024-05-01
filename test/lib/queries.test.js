import assert from "assert";
import esmock from "esmock";
import sinon from "sinon";
import {
  buildKboAddressQueryFull,
  buildKboAddressQueryDefault,
  buildContactPointQueryFull,
  buildContactPointQueryDefault,
  buildKboIdentifierQueryFull,
  buildKboOrgQueryFull,
  buildKboOrgQueryDefault,
  buildUpdateQueryFull,
  buildUpdateQueryDefault,
  updateKboOrgFullAddress,
  updateKboOrgFullContactPoint,
  updateKboOrgFullKboOrganisation,
  updateKboOrgDefaultAddress,
  updateKboOrgDefaultContactPoint,
  updateKboOrgDefaultKboOrganisation,
} from "./queries.data.js";

const querySudoStub = sinon.stub();
const updateSudoStub = sinon.stub();

// Stub `mu-auth-sudo` module and `mu` module part of `mu-semtech/mu-javascript-template` microservice
const {
  buildKboAddressQuery,
  buildContactPointQuery,
  buildKboIdentifierQuery,
  buildKboOrgQuery,
  buildUpdateQuery,
  updateKboOrg,
} = await esmock.strict(
  "../../lib/queries.js",
  {
    mu: {
      uuid: () => {
        return `1234567890`;
      },
      sparqlEscapeUri: (uri) => {
        return `<${uri}>`;
      },
      sparqlEscapeString: (str) => {
        return `"""${str}"""`;
      },
    },
    "@lblod/mu-auth-sudo": {
      querySudo: querySudoStub,
      updateSudo: updateSudoStub,
    },
  },
  {},
  {
    isModuleNotFoundError: false,
  }
);

const normalize = (str) => str.replace(/\s+/g, " ").trim();

describe("Queries", () => {
  afterEach(() => {
    querySudoStub.reset();
    updateSudoStub.reset();
  });

  describe("buildKboAddressQuery", () => {
    it("should return the correct query", () => {
      const result = buildKboAddressQuery(
        "http://addressUri",
        "addressUuid",
        "formattedAddress"
      );
      assert.strictEqual(
        normalize(result),
        normalize(buildKboAddressQueryFull)
      );
    });

    it("should return the correct query without formattedAddress", () => {
      const result = buildKboAddressQuery("http://addressUri", "addressUuid");
      assert.strictEqual(
        normalize(result),
        normalize(buildKboAddressQueryDefault)
      );
    });
  });

  describe("buildContactPointQuery", () => {
    it("should return the correct query", () => {
      const result = buildContactPointQuery(
        "http://contactPointUri",
        "contactPointUuid",
        "http://addressUri",
        {
          phone: "+32 2 123 45 67",
          website: "https://example.com",
          email: "aaa@bbb.com",
        }
      );
      assert.strictEqual(
        normalize(result),
        normalize(buildContactPointQueryFull)
      );
    });

    it("should return the correct query with emtpy kboFields", () => {
      const result = buildContactPointQuery(
        "http://contactPointUri",
        "contactPointUuid",
        "http://addressUri",
        {}
      );
      assert.strictEqual(
        normalize(result),
        normalize(buildContactPointQueryDefault)
      );
    });
  });

  describe("buildKboIdentifierQuery", () => {
    it("should return the correct query", () => {
      const result = buildKboIdentifierQuery(
        "http://kboIdentifierUri",
        "kboIdentifierUuid",
        "http://abbOrgKboIdentifierUri",
        "0207437468"
      );
      assert.strictEqual(
        normalize(result),
        normalize(buildKboIdentifierQueryFull)
      );
    });
  });

  describe("buildKboOrgQuery", () => {
    it("should return the correct query", () => {
      const result = buildKboOrgQuery(
        "http://kboOrgUri",
        "kboOrgUuid",
        "http://kboIdentifierUri",
        "http://contactPointUri",
        "http://abbOrgUri",
        {
          rechtsvorm: "Stad / gemeente",
          startDate: "1968-01-01",
          formalName: "formalName",
          shortName: "shortName",
          changeTime: "2024-01-01",
          activeState: "activeState",
        }
      );
      assert.strictEqual(normalize(result), normalize(buildKboOrgQueryFull));
    });

    it("should return the correct query with empty kboFields", () => {
      const result = buildKboOrgQuery(
        "http://kboOrgUri",
        "kboOrgUuid",
        "http://kboIdentifierUri",
        "http://contactPointUri",
        "http://abbOrgUri",
        {}
      );
      assert.strictEqual(normalize(result), normalize(buildKboOrgQueryDefault));
    });
  });

  describe("buildUpdateQuery", () => {
    it("should return the correct query", () => {
      const result = buildUpdateQuery(
        "http://kboOrgUri",
        "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
        "http://purl.org/dc/terms/modified",
        "2024-01-01",
        "<http://mu.semte.ch/graphs/administrative-unit>"
      );

      assert.strictEqual(normalize(result), normalize(buildUpdateQueryFull));
    });
    it("should return the correct query when object is undefined", () => {
      const result = buildUpdateQuery(
        "http://kboOrgUri",
        "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
        "http://purl.org/dc/terms/modified",
        undefined,
        "<http://mu.semte.ch/graphs/administrative-unit>"
      );

      assert.strictEqual(normalize(result), normalize(buildUpdateQueryDefault));
    });
  });

  describe("updateKboOrg", () => {
    it("should return the correct query", async () => {
      await updateKboOrg(
        {
          changeTime: "2023-11-15",
          shortName: "Aalst",
          ovoNumber: "OVO001992",
          kboNumber: "0207437468",
          formalName: "Stad Aalst",
          startDate: "1968-01-01",
          activeState: "active",
          rechtsvorm: "Stad/Gemeente",
          email: "info@aalst.be",
          phone: "053 77 93 00",
          website: "https://www.aalst.be",
          formattedAddress: "Werf 9, 9300 Aalst, België",
        },
        {
          addressUri: "http://addressUri",
          contactPointUri: "http://contactPointUri",
          kboOrgUri: "http://kboOrgUri",
        }
      );

      assert.strictEqual(updateSudoStub.callCount, 3);
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(0).args[0]),
        normalize(updateKboOrgFullAddress)
      );
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(1).args[0]),
        normalize(updateKboOrgFullContactPoint)
      );
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(2).args[0]),
        normalize(updateKboOrgFullKboOrganisation)
      );
    });

    it("should return the correct query with empty kboFields", async () => {
      await updateKboOrg(
        {},
        {
          addressUri: "http://addressUri",
          contactPointUri: "http://contactPointUri",
          kboOrgUri: "http://kboOrgUri",
        }
      );

      assert.strictEqual(updateSudoStub.callCount, 3);
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(0).args[0]),
        normalize(updateKboOrgDefaultAddress)
      );
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(1).args[0]),
        normalize(updateKboOrgDefaultContactPoint)
      );
      assert.deepStrictEqual(
        normalize(updateSudoStub.getCall(2).args[0]),
        normalize(updateKboOrgDefaultKboOrganisation)
      );
    });
  });
});
