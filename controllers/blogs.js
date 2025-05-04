const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const user = request.user

    const blog = new Blog({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes ?? 0,
        user: user.id
    })

    const savedBlog = await blog.save()
    user.notes = user.notes.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user
    const blogToDelete = await Blog.findById(request.params.id)

    if(!blogToDelete){
        return response.status(404).json({ error: 'blog not found' })
    }

    if(blogToDelete.user.toString() !== user._id.toString()){
        return response.status(403).json({ error: 'unauthorized to delete this blog'})    
    }
    
    await blogToDelete.deleteOne()
    response.status(204).end()
})

blogsRouter.patch('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user
    const blogToUpdate = await Blog.findById(request.params.id)

    if(!blogToUpdate){
        return response.status(404).json({ error: 'blog not found' })
    }

    if(blogToUpdate.user.toString() !== user._id.toString()){
        return response.status(403).json({ error: 'unauthorized to update this blog'})    
    }

    const updatedFields = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        updatedFields,
        { new: true, runValidators: true, context: 'query' }
    )

    response.status(200).json(updatedBlog)
})

module.exports = blogsRouter