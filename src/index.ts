import express, {Request, Response} from 'express'
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/types";
import {VideoCreateModel} from "./models/VideoCreateModel";
import {VideoViewModel} from "./models/VideoViewModel";
import {CourseUpdateModel} from "./models/CourseUpdateModel";
import {URIParamsCourseIdModel} from "./models/URIParamsCourseIdModel";
import {errorMessages, ErrorModel} from "./models/Error";

export const app = express()
const port =  process.env.PORT || 8000
enum availableResolutionsQuality {
    P144 = 'P144',
    P240 = 'P240',
    P360 = 'P360',
    P480 = 'P480',
    P720 = 'P720',
    P1080 = 'P1080',
    P1440 = 'P1440',
    P2160 = 'P2160',
}
type videoType = {
    id: number,
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: Array<string> | null
}
type DBType = {
    videos: Array<videoType>
}
const db: DBType = {
    videos: [
        {
            id: 1,
            title: 'front-end',
            author: 'Dimych',
            createdAt: '2022-11-08T19:00:32.614Z',
            publicationDate: '2022-11-08T19:00:32.615Z',
            availableResolutions: [
                availableResolutionsQuality.P144
            ],
            canBeDownloaded: true,
            minAgeRestriction: null
        },
    ]
}
const getCourseViewModel = (video: videoType): videoType => {
    return {
        id: video.id,
        title: video.title,
        author: video.author,
        canBeDownloaded: video.canBeDownloaded,
        createdAt: video.createdAt,
        publicationDate: video.publicationDate,
        availableResolutions: video.availableResolutions,
        minAgeRestriction: video.minAgeRestriction
    }
}

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('fdsgfdfsgdsfgds')
})
app.get('/videos', (req: Request, res: Response<Array<VideoViewModel>>) => {
    res.json(db.videos.map(getCourseViewModel))
})
app.post('/videos', (req: RequestWithBody<VideoCreateModel>, res: Response<VideoViewModel | ErrorModel>) => {
    const {title, author, availableResolutions} = req.body
    const errors: Array<errorMessages> = []
    const titleChecks = !title || title.length > 40
    const authorChecks = !author || author.length > 20
    if (titleChecks) {
        errors.push(
            {
                message: 'InputModel has incorrect values',
                field: 'title'
            }
        )
    }

    if (authorChecks) {
        errors.push(
            {
                message: 'InputModel has incorrect values',
                field: 'author'
            }
        )

    }
    console.log(availableResolutions)
    if (availableResolutions && availableResolutions.length ) {
        for (let i = 0;  i< availableResolutions.length; i++ ){
            if (!Object.keys(availableResolutionsQuality).includes(availableResolutions[i])){
                errors.push(
                    {
                        message: 'InputModel has incorrect values',
                        field: 'availableResolutions'
                    }
                )
                break
            }
        }

    }
    if (errors.length){
        res.status(400).json({
            errorsMessages: errors
        })
    }
    let date = new Date();

    new Date(date.setDate(date.getDate() + 1)).toISOString();
    const newVideo: VideoViewModel = {
        id: +new Date(),
        title,
        author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: date.toISOString(),
        publicationDate: new Date(date.setDate(date.getDate() + 1)).toISOString(),
        availableResolutions: availableResolutions.length >= 1 ? availableResolutions : null
    }


    db.videos.push(newVideo)
    res.status(201).json(getCourseViewModel(newVideo))

})
app.get('/videos/:id', (req: RequestWithParams<URIParamsCourseIdModel>, res: Response<VideoViewModel | ErrorModel>) => {
    const errors: Array<errorMessages> = []
    let foundVideo = db.videos.find(e => e.id === +req.params.id)
    if (!foundVideo) {
        errors.push(
            {
                message: 'No such video',
                field: 'id'
            }
        )
        res.sendStatus(404).json({
            errorsMessages: errors
        })
        return

    }
    res.status(200).json(getCourseViewModel(foundVideo))
})
app.put('/videos/:id', (req: RequestWithParamsAndBody<URIParamsCourseIdModel, CourseUpdateModel>, res: Response) => {
    let {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
    const errors400: Array<errorMessages> = []
    const errors404: Array<errorMessages> = []
    const titleChecks = !title || title.length > 40
    const authorChecks = !author || author.length > 20
    if (titleChecks) {
        errors400.push(
            {
                message: 'InputModel has incorrect values',
                field: 'title'
            }
        )
    }
    if (availableResolutions && availableResolutions.length ) {
        for (let i = 0;  i< availableResolutions.length; i++ ){
            if (!Object.keys(availableResolutionsQuality).includes(availableResolutions[i])){
                errors400.push(
                    {
                        message: 'InputModel has incorrect values',
                        field: 'availableResolutions'
                    }
                )
                break
            }
        }

    }

    if (authorChecks) {
        errors400.push(
            {
                message: 'InputModel has incorrect values',
                field: 'author'
            }
        )
    }
    if (typeof canBeDownloaded !== 'boolean'){
        errors400.push(
            {
                message: 'InputModel has incorrect values',
                field: 'canBeDownloaded'
            }
        )
    }
    let foundVideo = db.videos.find(e => e.id === +req.params.id)
    if (!foundVideo) {
        errors404.push(
            {
                message: 'No such video',
                field: 'id'
            }
        )
        res.sendStatus(404).json({
            errorsMessages: errors404
        })

    }
    if (typeof publicationDate !== 'string') {
        errors400.push(
            {
                message: 'No such video',
                field: 'publicationDate'
            }
        )

    }
    if (minAgeRestriction && (minAgeRestriction > 18 || minAgeRestriction < 1)) {
        errors400.push(
            {
                message: 'InputModel has incorrect values',
                field: 'minAgeRestriction'
            }
        )
    }
    if (errors400.length){
        res.status(400).json({
            errorsMessages: errors400
        })
    }
    else if (errors404.length){
        res.status(404).json({
            errorsMessages: errors404
        })
    }
    if (availableResolutions && availableResolutions.length < 1) {
        availableResolutions = null
        return
    }
    if (foundVideo){
        foundVideo.title = title
        foundVideo.publicationDate = publicationDate
        foundVideo.minAgeRestriction = minAgeRestriction
        foundVideo.canBeDownloaded = canBeDownloaded
        foundVideo.availableResolutions = availableResolutions
        foundVideo.author = author
    }
    res.sendStatus(204)

})
app.delete('/videos/:id', (req: RequestWithParams<{ id: String }>, res: Response) => {
    const errors: Array<errorMessages> = []
    let foundVideo = db.videos.find(e => e.id === +req.params.id)
    if (!foundVideo) {
        errors.push(
            {
                message: 'No such video',
                field: 'id'
            }
        )
        res.sendStatus(404).json({
            errorsMessages: errors
        })
        return

    }
    db.videos = db.videos.filter(c => c.id !== +req.params.id)
    res.sendStatus(204)
})
app.delete('/testing/all-data', (req: Request, res: Response) => {
    db.videos = []
    res.sendStatus(204)
})

app.listen(port,()=>{
    console.log(`Lintening on ${port}`)
})
