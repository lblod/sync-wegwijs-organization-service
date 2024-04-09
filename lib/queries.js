import { uuid, sparqlEscapeUri, sparqlEscapeString } from "mu";
import { querySudo as query, updateSudo as update } from "@lblod/mu-auth-sudo";

/**
 * Represents the information of the ABB organization.
 * @typedef {Object} AbbOrganizationInfo
 * @property {string} [kbo] The KBO number.
 * @property {string} [kboId] The URI of the KBO identifier.
 * @property {string} [kboStructuredId] The URI of the KBO structured identifier.
 * @property {string} [ovo] The OVO number.
 * @property {string} [ovoStructuredId] The URI of the OVO structured identifier.
 * @property {string} [abbOrgUri] The URI of the ABB organization.
 *
 * Get the information of the ABB organization linked to the given KBO organization.
 * @param {string} kboStructuredIdUuid The UUID of the KBO structured identifier.
 * @returns {Promise<AbbOrganizationInfo | null>} The information of the ABB organization.
 */
export async function getAbbOrganizationInfo(kboStructuredIdUuid) {
  const queryStr = `
    SELECT DISTINCT ?kbo ?kboId ?kboStructuredId ?ovo ?ovoStructuredId ?organization WHERE {
      VALUES ?g {
        <http://mu.semte.ch/graphs/administrative-unit>
        <http://mu.semte.ch/graphs/worship-service>
      }
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
      kboId: binding.kboId?.value,
      kboStructuredId: binding.kboStructuredId?.value,
      ovo: binding.ovo?.value,
      ovoStructuredId: binding.ovoStructuredId?.value,
      abbOrgUri: binding.organization?.value,
    };
  }

  return null;
}

/**
 * Represents the information of the KBO organization.
 * @typedef {Object} KboOrganizationInfo
 * @property {string} [kboOrg] The URI of the KBO organization.
 * @property {string} [abbOrg] The URI of the ABB organization.
 * @property {string} [modified] The time of the last change.
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
      VALUES ?g {
        <http://mu.semte.ch/graphs/administrative-unit>
        <http://mu.semte.ch/graphs/worship-service>
      }
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
      kboOrg: binding.kboOrg?.value,
      abbOrg: binding.abbOrg?.value,
      modified: binding.modified?.value,
      contactPointUri: binding.contactPointUri?.value,
      addressUri: binding.addressUri?.value,
    };
  }

  return null;
}

export async function constructOvoStructure(kboStructuredId) {
  const idUuid = uuid();
  const idUri = `http://data.lblod.info/id/identificatoren/${idUuid}`;
  const structuredIdUuid = uuid();
  const structuredIdUri = `http://data.lblod.info/id/gestructureerdeIdentificatoren/${structuredIdUuid}`;

  const updateStr = `
    INSERT {
      GRAPH ?g {
        ?organization <http://www.w3.org/ns/adms#identifier> ${sparqlEscapeUri(
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
      VALUES ?g {
        <http://mu.semte.ch/graphs/administrative-unit>
        <http://mu.semte.ch/graphs/worship-service>
      }
      GRAPH ?g {
        ${sparqlEscapeUri(
          kboStructuredId
        )} a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
          <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?kbo .

        ?kboId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ${sparqlEscapeUri(
          kboStructuredId
        )} ;
          <http://www.w3.org/2004/02/skos/core#notation> ?notation .

        ?organization <http://www.w3.org/ns/adms#identifier> ?kboId .

        FILTER (?notation IN ("KBO nummer"@nl, "KBO nummer"))
      }
    }
  `;

  await update(updateStr);
  return structuredIdUri;
}

export async function updateOvoNumberAndUri(ovoStructuredIdUri, wegwijsOvo) {
  let updateStr = `
    DELETE {
      GRAPH ?g {
        ?bestuureseenheid <http://www.w3.org/2002/07/owl#sameAs> ?ovoUri .
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
          ?bestuureseenheid <http://www.w3.org/2002/07/owl#sameAs> ${sparqlEscapeUri(
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
      VALUES ?g {
        <http://mu.semte.ch/graphs/administrative-unit>
        <http://mu.semte.ch/graphs/worship-service>
      }
      GRAPH ?g {

        ${sparqlEscapeUri(
          ovoStructuredIdUri
        )} a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> .

        OPTIONAL {
          ?bestuureseenheid
          <http://www.w3.org/ns/adms#identifier>/<https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ${sparqlEscapeUri(
            ovoStructuredIdUri
          )} ;
          <http://www.w3.org/2002/07/owl#sameAs> ?ovoUri .
        }

        OPTIONAL { ${sparqlEscapeUri(
          ovoStructuredIdUri
        )} <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo . }
      }
    }
  `;

  await update(updateStr);
}

export async function getAllAbbKboOrganizations() {
  let queryStr = `
   SELECT ?kbo ?ovo ?kboStructuredId ?ovoStructuredId ?abbOrg ?kboOrg ?kboId ?changeTime  where {
       VALUES ?g {
         <http://mu.semte.ch/graphs/administrative-unit>
         <http://mu.semte.ch/graphs/worship-service>
       }
       GRAPH ?g {
         ?kboId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?kboStructuredId ;
               <http://www.w3.org/2004/02/skos/core#notation> ?kboNotation .
     
         ?kboStructuredId a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
               <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?kbo .
     
         ?abbOrg <http://www.w3.org/ns/adms#identifier> ?kboId .
     
         FILTER (?kboNotation IN ("KBO nummer"@nl, "KBO nummer"))
         FILTER (!regex(?abbOrg, "kboOrganisaties","i"))
     
         OPTIONAL{
           ?kboOrg owl:sameAs ?abbOrg .
           ?kboOrg <http://purl.org/dc/terms/modified> ?changeTime ;
                    <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?rechtsVrom ;
                    <http://www.w3.org/2004/02/skos/core#altLabel> ?shortName ;
                    <http://mu.semte.ch/vocabularies/ext/startDate> ?startDate ;
                    <http://www.w3.org/ns/regorg#legalName> ?legalName ;
                    <http://www.w3.org/ns/regorg#orgStatus> ?activeState ;
                    <http://schema.org/contactPoint> ?contact .
   
           ?contact <http://schema.org/email> ?email ;
                    <http://schema.org/telephone> ?phone ;
                    <http://schema.org/contactType> ?contactType ;
                    <http://xmlns.com/foaf/0.1/page> ?website ;
                    <http://www.w3.org/ns/locn#address> ?address .
   
           ?address <http://www.w3.org/ns/locn#fullAddress> ?fullAddress.
   
         }
         OPTIONAL{
          ?abbOrg <http://www.w3.org/ns/adms#identifier> ?ovoId .
 
          ?ovoId <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> ?ovoStructuredId ;
            <http://www.w3.org/2004/02/skos/core#notation> ?ovoNotation .

          OPTIONAL { ?ovoStructuredId <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> ?ovo . }

          FILTER (?ovoNotation IN ("OVO-nummer"@nl, "OVO-nummer"))
        }
       }
     }
   
   `;
  const result = await query(queryStr);

  if (result.results.bindings.length) {
    const bindings = result.results.bindings;
    return bindings.map((binding) => {
      return {
        kbo: binding.kbo?.value,
        kboStructuredId: binding.kboStructuredId.value,
        ovo: binding.ovo?.value,
        ovoStructuredId: binding.ovoStructuredId?.value,
        kboOrg: binding.kboOrg?.value,
        abbOrg: binding.abbOrg?.value,
        kboId: binding.kboId?.value,
        changeTime: binding.changeTime?.value,
      };
    });
  }
  return null;
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
 * @param {KboFields} kboFields The fields of the KBO organization.
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
 * @param {KboFields} kboFields The fields of the KBO organization.
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
    )}
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
 * @param {KboFields} kboFields The fields of the KBO organization.
 * @param {string} kboIdentifierUri The KBO identifier URI.
 * @param {string} abbOrgUri The ABB organization URI.
 */
export async function createKboOrg(kboFields, kboIdentifierUri, abbOrgUri) {
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
  } WHERE{
    VALUES ?g {
      <http://mu.semte.ch/graphs/administrative-unit>
      <http://mu.semte.ch/graphs/worship-service>
    }
    GRAPH ?g {
      ?organization <http://www.w3.org/ns/adms#identifier> ${sparqlEscapeUri(
        kboIdentifierUri
      )} 
    }
  }   
  `;

  await update(updateStr);

  return kboOrgUri;
}

export async function updateKboOrg(newKboInfo, identifiers) {
  //update address
  await updateKboAddress(newKboInfo?.formattedAddress, identifiers.addressUri);

  //update ContactPoint
  await updateKboContact(newKboInfo, identifiers);

  //update kboOrg
  await updateKboOrganization(newKboInfo, identifiers);
}

/**
 * Update the address of the KBO organization.
 */
async function updateKboAddress(formattedAddress, addressUri) {
  let updateStr = `
  DELETE{
    GRAPH ?g{
      ?adressUri a <http://www.w3.org/ns/locn#Address> ;
                  <http://www.w3.org/ns/locn#fullAddress> ?fulladdress  .
    }
  }
    INSERT{
      graph ?g{ 
        ?adressUri a <http://www.w3.org/ns/locn#Address> 
`;
  if (formattedAddress) {
    updateStr += `
    ;
    <http://www.w3.org/ns/locn#fullAddress> ${sparqlEscapeString(
      formattedAddress
    )}
  `;
  }
  updateStr += `                    
          .
        }
      } 
`;
  updateStr += `
  WHERE{
    VALUES ?g {
      <http://mu.semte.ch/graphs/administrative-unit> 
      <http://mu.semte.ch/graphs/worship-service>
    }
    GRAPH ?g {
      ?adressUri a <http://www.w3.org/ns/locn#Address> ;
                <http://www.w3.org/ns/locn#fullAddress> ?fulladdress  .
      
      FILTER(?adressUri = ${sparqlEscapeUri(addressUri)})
    }
  }  
`;
  await update(updateStr);
}

async function updateKboContact(newKboInfo, identifiers) {
  let updateStr = `
  DELETE{
    GRAPH ?g{
      ?contact a <http://schema.org/ContactPoint> ;
                <http://schema.org/email> ?email ;
                <http://schema.org/telephone> ?phone ;
                <http://xmlns.com/foaf/0.1/page> ?website .
    }
  }
  INSERT{
    graph ?g{ 
      ?contact a <http://schema.org/ContactPoint> 
`;
  if (newKboInfo.email) {
    updateStr += `; <http://schema.org/email> ${sparqlEscapeString(
      newKboInfo.email
    )}`;
  }
  if (newKboInfo.phone) {
    updateStr += `; <http://schema.org/telephone> ${sparqlEscapeString(
      newKboInfo.phone
    )}`;
  }
  if (newKboInfo.phone) {
    updateStr += `; <http://xmlns.com/foaf/0.1/page> ${sparqlEscapeString(
      newKboInfo.website
    )}`;
  }
  updateStr += `
    .
  }
}
`;
  updateStr += `
WHERE{
  VALUES ?g {
    <http://mu.semte.ch/graphs/administrative-unit>
    <http://mu.semte.ch/graphs/worship-service>
  }
  GRAPH ?g {
    ?contact a <http://schema.org/ContactPoint> ;
              <http://schema.org/email> ?email ;
              <http://schema.org/telephone> ?phone ;
              <http://xmlns.com/foaf/0.1/page> ?website .
    
    FILTER(?contact = ${sparqlEscapeUri(identifiers.contactPointUri)})
  }
} 
`;
  await update(updateStr);
}
async function updateKboOrganization(newKboInfo, identifiers) {
  let updateStr = `
  DELETE{
    GRAPH ?g{
      ?kboOrg a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
                <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?rechtsVorm ;
                <http://www.w3.org/2004/02/skos/core#altLabel> ?shortName ;
                <http://mu.semte.ch/vocabularies/ext/startDate> ?startDate ;
                <http://www.w3.org/ns/regorg#legalName> ?orgName ;
                <http://purl.org/dc/terms/modified> ?changeTime ;
                <http://www.w3.org/ns/regorg#orgStatus> ?activeState .
    }                                
  }
  INSERT{
    graph ?g{ 
      ?kboOrg a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> 
`;
  if (newKboInfo.rechtsvorm) {
    updateStr += `
    ;
    <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ${sparqlEscapeString(
      newKboInfo.rechtsvorm
    )}
  `;
  }
  if (newKboInfo.startDate) {
    updateStr += `
    ;
    <http://mu.semte.ch/vocabularies/ext/startDate> ${sparqlEscapeString(
      newKboInfo.startDate
    )}
  `;
  }
  if (newKboInfo.formalName) {
    updateStr += `; <http://www.w3.org/ns/regorg#legalName> ${sparqlEscapeString(
      newKboInfo.formalName
    )}`;
  }
  if (newKboInfo.shortName) {
    updateStr += `; <http://www.w3.org/2004/02/skos/core#altLabel> ${sparqlEscapeString(
      newKboInfo.shortName
    )}`;
  }
  if (newKboInfo.changeTime) {
    updateStr += `
    ;
    <http://purl.org/dc/terms/modified> ${sparqlEscapeString(
      newKboInfo.changeTime
    )} 
  `;
  }
  if (newKboInfo.activeState) {
    updateStr += `
    ;
    <http://www.w3.org/ns/regorg#orgStatus> ${sparqlEscapeUri(
      newKboInfo.activeState
    )} 
  `;
  }
  updateStr += `          
          .
          }
        }
`;
  updateStr += `
  WHERE{
    VALUES ?g {
      <http://mu.semte.ch/graphs/administrative-unit>
      <http://mu.semte.ch/graphs/worship-service>
    }
    GRAPH ?g {
      ?kboOrg a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
                  <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?rechtsVorm ;
                  <http://www.w3.org/2004/02/skos/core#altLabel> ?shortName ;
                  <http://mu.semte.ch/vocabularies/ext/startDate> ?startDate ;
                  <http://www.w3.org/ns/regorg#legalName> ?orgName ;
                  <http://purl.org/dc/terms/modified> ?changeTime ;
                  <http://www.w3.org/ns/regorg#orgStatus> ?activeState .
      
      FILTER(?kboOrg = ${sparqlEscapeUri(identifiers.kboOrg)})
    }
  } 
`;

  await update(updateStr);
}

// Update queries: via mu-auth if it comes from the frontend ?
