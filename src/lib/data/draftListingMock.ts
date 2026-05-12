export interface DraftListingDetail {
  id: string
  address: string
  cityStateZip: string
  propertyType: string
  purchasePrice: number
  sellerLabel: string
  checklistTotal: number
  checklistCompleted: number
  heroImageUrl: string
  syncedFromApp1: boolean
}

export const DRAFT_LISTING_MOCK: DraftListingDetail = {
  id: 'draft-4821',
  address: '4821 Maple Drive',
  cityStateZip: 'Austin, TX 78701',
  propertyType: 'Single Family Home',
  purchasePrice: 185_000,
  sellerLabel: 'Verified Seller',
  checklistTotal: 4,
  checklistCompleted: 0,
  heroImageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuARiXjo93t4Wg-NmJAQc0FEyTJLK5Vjvx6PnqfWeaMl7wEA36_-n7AQXgxHXZ3qFZGvnAbGin4AefKT_Ug8yiA4eednHEsxrNpSKJuy7zrGE4RrBs4G0r_oGSU-UzWMjNB7evOEN_kJ7ahHcmQwAZL2vZfiZWbMikehQDB7Yii2HYEzZe9yZNEzAe7vgxRCFUjU-SEEoiJSAeVyBOEnOlV7bjCVOEjX2sldJqsajLIrQwrq5RkKjalGMpgQnJzc0qNAwq1swXMHGSg',
  syncedFromApp1: true,
}
