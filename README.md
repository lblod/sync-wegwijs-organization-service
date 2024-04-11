<a name="readme-top"></a>

<br />
<div align="center">
  <h1 align="center">sync-wegwijs-api-service</h1>
  <p align="center">
    Service sync wegwijs organizations data with OP 
    <br />
    <a href="https://github.com/lblod/sync-wegwijs-organization-service/issues">Report Bug</a>
    ·
    <a href="https://github.com/lblod/sync-wegwijs-organization-service/pulls">Open PR</a>
  </p>
</div>


## 📖 Description

This service maintains OP's OVO numbers and KboOganisation in sync together with [Wegwijs](https://wegwijs.vlaanderen.be/#/organisations).

- OVO numbers are stored in `<https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator>` and linked to ABB organizations via `<http://www.w3.org/ns/adms#identifier>`.
- Wegwijs data are saved in `<http://mu.semte.ch/vocabularies/ext/KboOrganisatie>` and linked to ABB organizations via `<http://www.w3.org/2002/07/owl#sameAs>`.

The service gets triggered when a KBO is added or updated in OP, as well as on a regular basis via a cron job to ensure our dataset is in sync with theirs.

*Note: Wegwijs currently (03/10/2023) don't have all the KBOs added in their database. For this reason, the behaviour we follow when we can't find a match on a KBO between OP and them is to leave the OVO number of OP untouched if it exists.*

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ⏩ Quick setup

### 🐋 Docker-compose.yml
```yaml
  sync-wegwijs-organization-service:
    image: lblod/sync-wegwijs-organization-service
    links:
      - db:database
    labels:
      - "logging=true"
    restart: always
    logging: *default-logging
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🔑 Environment variables

| ENV  | description | default | required |
|---|---|---|---|
| CRON_PATTERN | Cron pattern describing when the healing runs | '0 0 0 * * *' | |

<p align="right">(<a href="#readme-top">back to top</a>)</p>
