import request from 'supertest'
import {app} from '../../src'
import {VideoCreateModel} from "../../src/models/VideoCreateModel";

describe('/course', () => {
    beforeAll(async () => {
        await request(app).delete('/__test__/data')
    })

    it('should return 200 and empty array', async () => {
        await request(app).get('/courses').expect(200, [])
    })

    it('should return 404 for not existing course', async () => {
        await request(app).get('/courses/1').expect(404)
    })
    it('shouldn\'t create course cause of incorrect data', async () => {
        let data: { title: string } = {title: ''};
        await request(app).post('/courses').send(data).expect(400)
        await request(app).get('/courses').expect(200, [])
    })
    let createdCourse: any;
    it('should create course with correct input data', async () => {
        let title: {title:string} = {title:'it-incubator'}
        let data: any = title;
        const createResponse = await request(app).post('/courses').send(data).expect(201)
        createdCourse = createResponse.body
        expect(createdCourse).toEqual({
            id: expect.any(Number),
            title: title.title
        })
        await request(app).get('/courses').expect(200, [createdCourse])
    })

    it('shouldn\'t update course', async () => {
        let data = {title: ''};
        await request(app).put('/courses/' + createdCourse.id).send(data).expect(400)
        await request(app).get('/courses/' + createdCourse.id).expect(200, createdCourse)
    })

    it('should update course with correct input data', async () => {
        await request(app).put('/courses/' + createdCourse.id).send({title: 'it--id'}).expect(204)
        await request(app).get('/courses/' + createdCourse.id).expect(200, {...createdCourse, title: 'it--id'})
    })

    it('should delete', async () => {
        await request(app).delete('/courses/' + createdCourse.id).expect(204)
        await request(app).get('/courses/' + createdCourse.id).expect(404)
    })

})
