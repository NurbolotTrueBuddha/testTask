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

const path = 'C:\\Users\\zzhap\\%userprofile%\\.postgresql\\root.crt';
const config = {
  connectionString:
    'postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path).toString(),
  },
};

async function importData() {
  const client = new pg.Client(config);
  await client.connect();
  console.log(client)

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
