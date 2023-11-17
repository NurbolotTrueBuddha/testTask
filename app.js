const fetch = require('node-fetch');
const pg = require("pg");
const fs = require("fs");

const tableName = 'Nurbolot';

const createTableQuery = `
CREATE TABLE ${tableName} (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  status VARCHAR(50),
  species VARCHAR(100),
  type VARCHAR(100),
  gender VARCHAR(20),
  origin VARCHAR(255)
);
`;

const insertCharacterQuery = `
INSERT INTO ${tableName} (name, status, species, type, gender, origin) VALUES ($1, $2, $3, $4, $5, $6);
`;

const apiUrl = 'https://rickandmortyapi.com/api/character/';

async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

const config = {
  connectionString:
    'postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1',
  ssl: {
    rejectUnauthorized: false,
    ca: `-----BEGIN CERTIFICATE-----
    MIIE3TCCAsWgAwIBAgIKPxb5sAAAAAAAFzANBgkqhkiG9w0BAQ0FADAfMR0wGwYD
    VQQDExRZYW5kZXhJbnRlcm5hbFJvb3RDQTAeFw0xNzA2MjAxNjQ0MzdaFw0yNzA2
    MjAxNjU0MzdaMFUxEjAQBgoJkiaJk/IsZAEZFgJydTEWMBQGCgmSJomT8ixkARkW
    BnlhbmRleDESMBAGCgmSJomT8ixkARkWAmxkMRMwEQYDVQQDEwpZYW5kZXhDTENB
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqgNnjk0JKPcbsk1+KG2t
    eM1AfMnEe5RkAJuBBuwVV49snhcvO1jhKBx/pCnjr6biICc1/oAFDVgU8yVYYPwp
    WZ2vH3ZtscjJ/RAT/NS9OKKG7kKknhFhVYxua5xhoIQmm6usBNYYiTcWoFm1eHC8
    I9oddOLSscZYbh3unVRvt+3V+drVmUx9oSUKpqMgfysiv1MN6zB3vq9TFkbhz53E
    k0tEcV+W2NnDaeFhLKy284FDKLvOdTDj1EDsSAihxl7sNEKpupNuhgyy2siOqUb+
    d5mO/CRfaAKGg3E6hDM3pEi48E506dJdjPXWfHKSvuguMLRlb2RWdVocRZuyWxOh
    0QIDAQABo4HkMIHhMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRMU5uItjx+
    TOicX1+ovC1Xq2PSnzAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8E
    BAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBSrucX/oe/mUx0zOSKE
    0XbUN04tajBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vY3Jscy55YW5kZXgucnUv
    WWFuZGV4SW50ZXJuYWxSb290Q0EvWWFuZGV4SW50ZXJuYWxSb290Q0EuY3JsMA0G
    CSqGSIb3DQEBDQUAA4ICAQAsR5Lb4Pv2FD0Kk+4oc1GEOnehxKLsQtdV81nrU+IV
    l9pr2oNMdi8lwIolvHZRllLM4Ba5AcRH6YJ5fe7AjKm+5EdSkhqVWo2UOllRCbtS
    wmL50+erOAkxstSlRkO6b8x1L0MOBKv54E5YcQ/Wwt27ldSb6RkEmJBGvmxObAaf
    5zc51pqSqao9tnldYaCblEQ/Zmy43FliIpa2eUJoh8DqK8bVo2gcI3wbQ32tWs9u
    wvKk8fo4lAdhCwhv+QHuqau1VAY9hPU106bsFIDUmijTMxjAobKBi6CkIX6EbNHU
    Jv4DzYVLlDd2y0CADdn2F6I70xpCBn5cquSGuvFbqZjQDmIHwb7WQSxadkiGRWfc
    zVTnmiHjJONJJIpE2t+FOV3hc+8o98OzOtNaH2QQ9j6dnKvtIGKGFeNSDp0vXPOi
    QhHiIyuB7eWx+g2whktQ74UCpGDSXYnEW3s8w5wezVWIEmouq7q4rCEkTNvJ7Ico
    43AgUdPzAFS2zYktw1C+cbUALM8smvXbXrXOBzMmscjIhtXvLMrpPeh23VfdJfQB
    0rN2BmRCLUE8JOV+o0k98XMm83oN+lGkL1l+hyoj3ok1uI3JrsWOcDyjOds3ptcN
    KimJLm27ndjcxDNo/iA6gefMJuCxFRaqI+eF4P0jSkMgnnQqZkvLGFuHCw8eRDhm
    bw==
    -----END CERTIFICATE-----
    -----BEGIN CERTIFICATE-----
    MIIFGTCCAwGgAwIBAgIQJMM7ZIy2SYxCBgK7WcFwnjANBgkqhkiG9w0BAQ0FADAf
    MR0wGwYDVQQDExRZYW5kZXhJbnRlcm5hbFJvb3RDQTAeFw0xMzAyMTExMzQxNDNa
    Fw0zMzAyMTExMzUxNDJaMB8xHTAbBgNVBAMTFFlhbmRleEludGVybmFsUm9vdENB
    MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAgb4xoQjBQ7oEFk8EHVGy
    1pDEmPWw0Wgw5nX9RM7LL2xQWyUuEq+Lf9Dgh+O725aZ9+SO2oEs47DHHt81/fne
    5N6xOftRrCpy8hGtUR/A3bvjnQgjs+zdXvcO9cTuuzzPTFSts/iZATZsAruiepMx
    SGj9S1fGwvYws/yiXWNoNBz4Tu1Tlp0g+5fp/ADjnxc6DqNk6w01mJRDbx+6rlBO
    aIH2tQmJXDVoFdrhmBK9qOfjxWlIYGy83TnrvdXwi5mKTMtpEREMgyNLX75UjpvO
    NkZgBvEXPQq+g91wBGsWIE2sYlguXiBniQgAJOyRuSdTxcJoG8tZkLDPRi5RouWY
    gxXr13edn1TRDGco2hkdtSUBlajBMSvAq+H0hkslzWD/R+BXkn9dh0/DFnxVt4XU
    5JbFyd/sKV/rF4Vygfw9ssh1ZIWdqkfZ2QXOZ2gH4AEeoN/9vEfUPwqPVzL0XEZK
    r4s2WjU9mE5tHrVsQOZ80wnvYHYi2JHbl0hr5ghs4RIyJwx6LEEnj2tzMFec4f7o
    dQeSsZpgRJmpvpAfRTxhIRjZBrKxnMytedAkUPguBQwjVCn7+EaKiJfpu42JG8Mm
    +/dHi+Q9Tc+0tX5pKOIpQMlMxMHw8MfPmUjC3AAd9lsmCtuybYoeN2IRdbzzchJ8
    l1ZuoI3gH7pcIeElfVSqSBkCAwEAAaNRME8wCwYDVR0PBAQDAgGGMA8GA1UdEwEB
    /wQFMAMBAf8wHQYDVR0OBBYEFKu5xf+h7+ZTHTM5IoTRdtQ3Ti1qMBAGCSsGAQQB
    gjcVAQQDAgEAMA0GCSqGSIb3DQEBDQUAA4ICAQAVpyJ1qLjqRLC34F1UXkC3vxpO
    nV6WgzpzA+DUNog4Y6RhTnh0Bsir+I+FTl0zFCm7JpT/3NP9VjfEitMkHehmHhQK
    c7cIBZSF62K477OTvLz+9ku2O/bGTtYv9fAvR4BmzFfyPDoAKOjJSghD1p/7El+1
    eSjvcUBzLnBUtxO/iYXRNo7B3+1qo4F5Hz7rPRLI0UWW/0UAfVCO2fFtyF6C1iEY
    /q0Ldbf3YIaMkf2WgGhnX9yH/8OiIij2r0LVNHS811apyycjep8y/NkG4q1Z9jEi
    VEX3P6NEL8dWtXQlvlNGMcfDT3lmB+tS32CPEUwce/Ble646rukbERRwFfxXojpf
    C6ium+LtJc7qnK6ygnYF4D6mz4H+3WaxJd1S1hGQxOb/3WVw63tZFnN62F6/nc5g
    6T44Yb7ND6y3nVcygLpbQsws6HsjX65CoSjrrPn0YhKxNBscF7M7tLTW/5LK9uhk
    yjRCkJ0YagpeLxfV1l1ZJZaTPZvY9+ylHnWHhzlq0FzcrooSSsp4i44DB2K7O2ID
    87leymZkKUY6PMDa4GkDJx0dG4UXDhRETMf+NkYgtLJ+UIzMNskwVDcxO4kVL+Hi
    Pj78bnC5yCw8P5YylR45LdxLzLO68unoXOyFz1etGXzszw8lJI9LNubYxk77mK8H
    LpuQKbSbIERsmR+QqQ==
    -----END CERTIFICATE-----`,
  },
};

async function importData() {
  const client = new pg.Client(config);
  await client.connect();

  try {
    await client.query(createTableQuery);

    const characters = await fetchData(apiUrl);

    for (const character of characters) {
      const origin = character.origin ? character.origin.name : null;
      await client.query(insertCharacterQuery, [
        character.name,
        character.status,
        character.species,
        character.type,
        character.gender,
        origin,
      ]);
    }
    const result = await client.query(`SELECT * FROM ${tableName}`);

    console.log('Данные успешно добавлены в таблицу', tableName, result.rows);

  } catch (error) {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    console.error('Произошла ошибка:', error, result.rows);
  } finally {
    await client.end();
  }
}

importData();
