import TrialRedeemCodeTable from '@/components/trial-redeem-code/trial-redeem-code-table'

export const dynamic = 'force-dynamic'

type TrialRedeemCodesPageProps = {
  /** `?search=GO-…` opens the table searched for that code. */
  searchParams?: Promise<{ search?: string }>
}

const TrialRedeemCodesPage = async ({
  searchParams,
}: TrialRedeemCodesPageProps) => {
  const search = (await searchParams)?.search ?? ''
  // Keyed, so a new `?search=` link reopens the table on that search.
  return <TrialRedeemCodeTable key={search} initialSearch={search} />
}

export default TrialRedeemCodesPage
