const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    describe('user creation', () => {
        test('succeeds with valid username and password', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'validuser',
                name: 'Valid User',
                password: 'validpass',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

            const usernames = usersAtEnd.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })

        test('fails with proper status and message if username already taken', async () => {
            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'password123',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert(result.body.error.includes('username must be unique'))
        })

        test('fails if username or password is shorter than 3 characters', async () => {
            const newUser = {
                username: 'ab',
                name: 'Test',
                password: '12',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert(result.body.error.includes('at least 3 characters'))
        })

        test('fails if username or password is missing', async () => {
            const newUser = {
                name: 'Missing Stuff',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert(result.body.error.includes('required'))
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})