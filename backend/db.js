import { JSONFilePreset } from 'lowdb/node'

const defaultData = { characters: [] }

export const db = await JSONFilePreset('db.json', defaultData)