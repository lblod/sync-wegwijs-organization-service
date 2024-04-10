import assert from "assert";
import esmock from "esmock";

const {
  buildKboAddressQuery,
  buildContactPointQuery,
  buildKboOrgQuery,
  buildUpdateQuery,
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
      querySudo: async () => {
        return {
          results: {
            bindings: [],
          },
        };
      },
      updateSudo: async () => {
        return {
          results: {
            bindings: [],
          },
        };
      },
    },
  },
  {},
  {
    isModuleNotFoundError: false,
  }
);

const normalize = (str) => str.replace(/\s+/g, " ").trim();

describe("Queries", () => {
  // buildKboAddressQuery
  // buildContactPointQuery
  // buildKboOrgQuery
  // createKboOrg

  describe("buildKboAddressQuery", () => {
    it("should return the correct query", () => {
      const result = buildKboAddressQuery(
        "http://addressUri",
        "addressUuid",
        "formattedAddress"
      );
      assert.strictEqual(
        normalize(result),
        normalize(`
        <http://addressUri> a <http://www.w3.org/ns/locn#Address> ;
            <http://mu.semte.ch/vocabularies/core/uuid> """addressUuid""" ;
            <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
            <http://www.w3.org/ns/locn#fullAddress> """formattedAddress""" .
        `)
      );
    });

    it("should return the correct query without formattedAddress", () => {
      const result = buildKboAddressQuery("http://addressUri", "addressUuid");
      assert.strictEqual(
        normalize(result),
        normalize(`
            <http://addressUri> a <http://www.w3.org/ns/locn#Address> ;
                <http://mu.semte.ch/vocabularies/core/uuid> """addressUuid""" ;
                <http://purl.org/dc/terms/source> <https://economie.fgov.be/> .
            `)
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
        normalize(`
        <http://contactPointUri> a <http://schema.org/ContactPoint> ;
            <http://mu.semte.ch/vocabularies/core/uuid> """contactPointUuid""" ;
            <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
            <http://schema.org/contactType> """Primary""" ;
            <http://www.w3.org/ns/locn#address> <http://addressUri> ;
            <http://schema.org/email> """aaa@bbb.com""" ;
            <http://schema.org/telephone> """+32 2 123 45 67""" ;
            <http://xmlns.com/foaf/0.1/page> """https://example.com""" .
        `)
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
        normalize(`
            <http://contactPointUri> a <http://schema.org/ContactPoint> ;
                <http://mu.semte.ch/vocabularies/core/uuid> """contactPointUuid""" ;
                <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
                <http://schema.org/contactType> """Primary""" ;
                <http://www.w3.org/ns/locn#address> <http://addressUri> .
            `)
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
      assert.strictEqual(
        normalize(result),
        normalize(`
        <http://kboOrgUri> a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://mu.semte.ch/vocabularies/core/uuid> """kboOrgUuid""" 
            <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ; 
            <http://www.w3.org/2002/07/owl#sameAs> <http://abbOrgUri> ; 
            <http://schema.org/contactPoint> <http://contactPointUri> ; 
            <http://www.w3.org/ns/adms#identifier> <http://kboIdentifierUri> ; 
            <http://mu.semte.ch/vocabularies/ext/rechtsvorm> """Stad / gemeente""" ; 
            <http://mu.semte.ch/vocabularies/ext/startDate> """1968-01-01""" ; 
            <http://www.w3.org/ns/regorg#legalName> """formalName""" ; 
            <http://www.w3.org/2004/02/skos/core#altLabel> """shortName""" ; 
            <http://purl.org/dc/terms/modified> """2024-01-01""" ; 
            <http://www.w3.org/ns/regorg#orgStatus> <activeState> .

        `)
      );
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
      assert.strictEqual(
        normalize(result),
        normalize(`
            <http://kboOrgUri> a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
                <http://mu.semte.ch/vocabularies/core/uuid> """kboOrgUuid""" 
                <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ; 
                <http://www.w3.org/2002/07/owl#sameAs> <http://abbOrgUri> ; 
                <http://schema.org/contactPoint> <http://contactPointUri> ; 
                <http://www.w3.org/ns/adms#identifier> <http://kboIdentifierUri> .
            `)
      );
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

      assert.strictEqual(
        normalize(result),
        normalize(`
        DELETE { 
          GRAPH ?g { 
            ?s <http://purl.org/dc/terms/modified> ?o . 
          } 
        } 
        INSERT { 
          GRAPH ?g { 
            ?s <http://purl.org/dc/terms/modified> """2024-01-01""" . 
          } 
        } 
        WHERE { 
          VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> } 
          GRAPH ?g { 
            ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
            OPTIONAL { ?s <http://purl.org/dc/terms/modified> ?o .} 
            BIND(<http://kboOrgUri> as ?s) 
          } 
        }
        `)
      );
    });
    it("should return the correct query when object is undefined", () => {
      const result = buildUpdateQuery(
        "http://kboOrgUri",
        "http://mu.semte.ch/vocabularies/ext/KboOrganisatie",
        "http://purl.org/dc/terms/modified",
        undefined,
        "<http://mu.semte.ch/graphs/administrative-unit>"
      );

      assert.strictEqual(
        normalize(result),
        normalize(`
            DELETE { 
              GRAPH ?g { 
                ?s <http://purl.org/dc/terms/modified> ?o . 
              } 
            } 
            WHERE { 
              VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> } 
              GRAPH ?g { 
                ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
                OPTIONAL { ?s <http://purl.org/dc/terms/modified> ?o .} 
                BIND(<http://kboOrgUri> as ?s) 
              } 
            }
            `)
      );
    });
  });
});
