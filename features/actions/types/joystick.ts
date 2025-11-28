export type Joystick = {
    accountId: string
    actionCode: string | null
    actionId: string | null
    actionName: string | null
    buttonCode: string
    createdDate: string
    danceCode: string | null
    danceId: string | null
    danceName: string | null
    expressionCode: string | null
    expressionId: string | null
    expressionName: string | null
    extendedActionCode: string | null
    extendedActionId: string | null
    extendedActionName: string | null
    id: string
    lastUpdate: string | null
    robotId: string
    skillCode: string | null
    skillId: string | null
    skillName: string | null
    status: number
    type: string
}
export type JoystickResponse = {
    joysticks: Joystick[]
}