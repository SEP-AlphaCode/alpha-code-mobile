export type Profile = {
    id: string
    name: string
    passcode: string
    accountId: string
    accountFullName: string
    avartarUrl: string
    isKid: boolean // true = Children, false = Parent
    lastActiveAt: string
    createDate: string
    lastUpdated: string
    status: number
    statusText: string
}