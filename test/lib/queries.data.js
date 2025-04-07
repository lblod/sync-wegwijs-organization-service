export const buildKboAddressQueryFull = `
<http://addressUri> a <http://www.w3.org/ns/locn#Address> ;
    <http://mu.semte.ch/vocabularies/core/uuid> """addressUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://www.w3.org/ns/locn#fullAddress> """formattedAddress""" .
`;

export const buildKboAddressQueryDefault = `
<http://addressUri> a <http://www.w3.org/ns/locn#Address> ;
    <http://mu.semte.ch/vocabularies/core/uuid> """addressUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> .
`;

export const buildContactPointQueryFull = `
<http://contactPointUri> a <http://schema.org/ContactPoint> ;
    <http://mu.semte.ch/vocabularies/core/uuid> """contactPointUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://schema.org/contactType> """Primary""" ;
    <http://www.w3.org/ns/locn#address> <http://addressUri> ;
    <http://schema.org/email> """aaa@bbb.com""" ;
    <http://schema.org/telephone> """+32 2 123 45 67""" ;
    <http://xmlns.com/foaf/0.1/page> """https://example.com""" .
`;

export const buildContactPointQueryDefault = `
<http://contactPointUri> a <http://schema.org/ContactPoint> ;
    <http://mu.semte.ch/vocabularies/core/uuid> """contactPointUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://schema.org/contactType> """Primary""" ;
    <http://www.w3.org/ns/locn#address> <http://addressUri> .
`;

export const buildKboIdentifierQueryFull = `
<http://data.lblod.info/id/gestructureerdeIdentificator/1234567890> a <https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator> ;
  <http://mu.semte.ch/vocabularies/core/uuid> """1234567890""" ;
  <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
  <https://data.vlaanderen.be/ns/generiek#lokaleIdentificator> """0207437468""" . 

<http://kboIdentifierUri> a <http://www.w3.org/ns/adms#Identifier> ;
  <http://mu.semte.ch/vocabularies/core/uuid> """kboIdentifierUuid""" ;
  <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
  <http://www.w3.org/2004/02/skos/core#notation> """KBO nummer""" ;
  <https://data.vlaanderen.be/ns/generiek#gestructureerdeIdentificator> <http://data.lblod.info/id/gestructureerdeIdentificator/1234567890> ; 
  <http://www.w3.org/2002/07/owl#sameAs> <http://abbOrgKboIdentifierUri> .
`;

export const buildKboOrgQueryFull = `
<http://kboOrgUri> a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
    <http://mu.semte.ch/vocabularies/core/uuid> """kboOrgUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ;
    <http://www.w3.org/2002/07/owl#sameAs> <http://abbOrgUri> ;
    <http://schema.org/contactPoint> <http://contactPointUri> ;
    <http://www.w3.org/ns/adms#identifier> <http://kboIdentifierUri> ;
    <http://mu.semte.ch/vocabularies/ext/rechtsvorm> """Stad / gemeente""" ;
    <http://mu.semte.ch/vocabularies/ext/startDate> "1968-01-01"^^xsd:date ;
    <http://www.w3.org/ns/regorg#legalName> """formalName""" ;
    <http://www.w3.org/2004/02/skos/core#altLabel> """shortName""" ;
    <http://purl.org/dc/terms/modified> "2024-01-01"^^xsd:date ;
    <http://www.w3.org/ns/regorg#orgStatus> <http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6> .
`;

export const buildKboOrgQueryDefault = `
<http://kboOrgUri> a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
    <http://mu.semte.ch/vocabularies/core/uuid> """kboOrgUuid""" ;
    <http://purl.org/dc/terms/source> <https://economie.fgov.be/> ; 
    <http://www.w3.org/2002/07/owl#sameAs> <http://abbOrgUri> ; 
    <http://schema.org/contactPoint> <http://contactPointUri> ; 
    <http://www.w3.org/ns/adms#identifier> <http://kboIdentifierUri> .
`;

export const buildUpdateQueryFull = `
DELETE { 
  GRAPH ?g { 
    ?s <http://purl.org/dc/terms/modified> ?o . 
  } 
}
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> } 
  GRAPH ?g {
    BIND (<http://kboOrgUri> AS ?s)
    ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
      <http://purl.org/dc/terms/modified> ?o .
  } 
}
;
INSERT { 
  GRAPH ?g { 
    ?s <http://purl.org/dc/terms/modified> "2024-01-01"^^xsd:date . 
  } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> } 
  GRAPH ?g {
    BIND (<http://kboOrgUri> AS ?s) 
    ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
  } 
}
`;

export const buildUpdateQueryDefault = `
DELETE { 
  GRAPH ?g { 
    ?s <http://purl.org/dc/terms/modified> ?o . 
  } 
}
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> } 
  GRAPH ?g {
    BIND (<http://kboOrgUri> AS ?s) 
    ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ;
      <http://purl.org/dc/terms/modified> ?o .
  } 
}
`;

export const updateKboOrgFullAddress = `
DELETE { 
  GRAPH ?g { ?s <http://www.w3.org/ns/locn#fullAddress> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://addressUri> AS ?s) 
    ?s a <http://www.w3.org/ns/locn#Address> ; 
      <http://www.w3.org/ns/locn#fullAddress> ?o . } } 
; 
INSERT { 
  GRAPH ?g { 
    ?s <http://www.w3.org/ns/locn#fullAddress> """Werf 9, 9300 Aalst, België""" . 
  } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://addressUri> AS ?s) 
    ?s a <http://www.w3.org/ns/locn#Address> . 
  } 
}
`;

export const updateKboOrgFullContactPoint = `
DELETE { 
  GRAPH ?g { ?s <http://schema.org/email> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://schema.org/email> ?o . 
  } 
} 
; 
INSERT { 
  GRAPH ?g { ?s <http://schema.org/email> """info@aalst.be""" . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> . 
  } 
} 
; 
DELETE { 
  GRAPH ?g { ?s <http://schema.org/telephone> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://schema.org/telephone> ?o . 
  } 
} 
; 
INSERT { 
  GRAPH ?g { ?s <http://schema.org/telephone> """053 77 93 00""" . } 
} WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g { 
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> .
  } 
} 
; 
DELETE { 
  GRAPH ?g { ?s <http://xmlns.com/foaf/0.1/page> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://xmlns.com/foaf/0.1/page> ?o . 
  } 
} 
; 
INSERT { 
  GRAPH ?g { ?s <http://xmlns.com/foaf/0.1/page> """https://www.aalst.be""" . } 
} WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> . 
  } 
}
`;

export const updateKboOrgFullKboOrganisation = `
DELETE { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/rechtsvorm> """Stad/Gemeente""" . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/2004/02/skos/core#altLabel> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/2004/02/skos/core#altLabel> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://www.w3.org/2004/02/skos/core#altLabel> """Aalst""" . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/startDate> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://mu.semte.ch/vocabularies/ext/startDate> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/startDate> "1968-01-01"^^xsd:date . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#legalName> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/ns/regorg#legalName> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#legalName> """Stad Aalst""" . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://purl.org/dc/terms/modified> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://purl.org/dc/terms/modified> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://purl.org/dc/terms/modified> "2023-11-15"^^xsd:date . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#orgStatus> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/ns/regorg#orgStatus> ?o . 
    } 
} 
; 
INSERT { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#orgStatus> <http://lblod.data.gift/concepts/63cc561de9188d64ba5840a42ae8f0d6> . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> . 
    }
}
`;

export const updateKboOrgDefaultAddress = `
DELETE { 
  GRAPH ?g { ?s <http://www.w3.org/ns/locn#fullAddress> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://addressUri> AS ?s) 
    ?s a <http://www.w3.org/ns/locn#Address> ; 
      <http://www.w3.org/ns/locn#fullAddress> ?o . } } 
`;

export const updateKboOrgDefaultContactPoint = `
DELETE { 
  GRAPH ?g { ?s <http://schema.org/email> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://schema.org/email> ?o . 
  } 
} 
; 
DELETE { 
  GRAPH ?g { ?s <http://schema.org/telephone> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://schema.org/telephone> ?o . 
  } 
} 
; 
DELETE { 
  GRAPH ?g { ?s <http://xmlns.com/foaf/0.1/page> ?o . } 
} 
WHERE { 
  VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
  GRAPH ?g {
    BIND (<http://contactPointUri> AS ?s) 
    ?s a <http://schema.org/ContactPoint> ; 
      <http://xmlns.com/foaf/0.1/page> ?o . 
  } 
} 
`;

export const updateKboOrgDefaultKboOrganisation = `
DELETE { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://mu.semte.ch/vocabularies/ext/rechtsvorm> ?o . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/2004/02/skos/core#altLabel> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
            BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/2004/02/skos/core#altLabel> ?o . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://mu.semte.ch/vocabularies/ext/startDate> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://mu.semte.ch/vocabularies/ext/startDate> ?o . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#legalName> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/ns/regorg#legalName> ?o . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://purl.org/dc/terms/modified> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://purl.org/dc/terms/modified> ?o . 
    } 
} 
; 
DELETE { 
    GRAPH ?g { ?s <http://www.w3.org/ns/regorg#orgStatus> ?o . } 
} 
WHERE { 
    VALUES ?g { <http://mu.semte.ch/graphs/administrative-unit> <http://mu.semte.ch/graphs/worship-service> } 
    GRAPH ?g {
        BIND (<http://kboOrgUri> AS ?s) 
        ?s a <http://mu.semte.ch/vocabularies/ext/KboOrganisatie> ; 
            <http://www.w3.org/ns/regorg#orgStatus> ?o . 
    } 
} 
`;
