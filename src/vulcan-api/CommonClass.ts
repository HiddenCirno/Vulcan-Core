export interface ItemLocale 
{
    Name: string
    Short: string
    Desc: string
}
export interface QuestLocale 
{
    Name: string
    Desc: string
    Success: string
    Fail: string
}
export interface TraderLocale 
{
    FName: string
    LName: string
    NName: string
    Desc: string
    Locate: string
}
export type Primitive = string | number | boolean | null | undefined;
export type NestedObject = { [key: string]: Primitive | NestedObject | NestedObject[] };