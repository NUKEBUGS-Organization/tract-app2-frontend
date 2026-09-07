import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

async function loadMapper(name) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}

const party = { _id: 'person', fullName: 'Example', avatarUrl: 'https://cdn.example/avatar.jpg' }
const { mapApiListing } = await loadMapper('mapListing')
const { mapApiDeal } = await loadMapper('mapDeal')
const { mapApiContract } = await loadMapper('mapContract')
const listing = mapApiListing({ wholesalerId: party, photoUrls: ['https://cdn.example/property.jpg'] })
assert.equal(listing.wholesaler.avatarUrl, party.avatarUrl)
assert.deepEqual(listing.photoUrls, ['https://cdn.example/property.jpg'])
assert.equal(mapApiDeal({ primaryBuyerId: party }).primaryBuyer.avatarUrl, party.avatarUrl)
assert.equal(mapApiContract({ buyerId: party }).buyerId.avatarUrl, party.avatarUrl)
console.log('Media mapping regressions passed')
