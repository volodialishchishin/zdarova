export type CourseUpdateModel = {
    title:string
    author:string
    availableResolutions:Array<string> | null
    canBeDownloaded:boolean
    minAgeRestriction:number | null
    publicationDate:string
}
