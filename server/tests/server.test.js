const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Task} = require('./../models/task');
const {User} = require('./../models/user');
const {tasks, populateTasks, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTasks);

describe('POST /tasks', () => {
  it('should create a new task', (done) => {
    var title = 'Test task title';
    console.log('user token:',users[0].tokens.token);

    request(app)
      .post('/tasks')
      .set('x-auth', users[0].tokens[0].token)
      .send({title})
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe(title);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Task.find({title}).then((tasks) => {
          expect(tasks.length).toBe(1);
          expect(tasks[0].title).toBe(title);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create task with invalid body data', (done) => {
    request(app)
      .post('/tasks')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Task.find().then((tasks) => {
          expect(tasks.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /tasks', () => {
  it('should get all tasks', (done) => {
    request(app)
      .get('/tasks')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.tasks.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /tasks/:id', () => {
  it('should return task doc', (done) => {
    request(app)
      .get(`/tasks/${tasks[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.task.title).toBe(tasks[0].title);
      })
      .end(done);
  });

  it('should not return task doc created by another user', (done) => {
    request(app)
      .get(`/tasks/${tasks[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  
  it('should return 404 if task not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/tasks/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/tasks/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /tasks/:id', () => {
  it('should remove a task', (done) => {
    var hexId = tasks[1]._id.toHexString();
    request(app)
      .delete(`/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.task._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Task.findById(hexId).then((task) => {
          expect(task).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should remove a task', (done) => {
    var hexId = tasks[0]._id.toHexString();
    request(app)
      .delete(`/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Task.findById(hexId).then((task) => {
          expect(task).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if task not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/tasks/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /tasks/:id', () => {
  it('should update the task', (done) => {
    var hexId = tasks[0]._id.toHexString();
    var title = 'This should be the new title';

    request(app)
      .patch(`/tasks/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        title
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.title).toBe(title);
        expect(res.body.task.completed).toBe(true);
        expect(res.body.task.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update the task of another user', (done) => {
    var hexId = tasks[0]._id.toHexString();
    var title = 'This should be the new title';

    request(app)
      .patch(`/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        title
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when task is not completed', (done) => {
    var hexId = tasks[1]._id.toHexString();
    var title = 'This should be the new title!!';

    request(app)
      .patch(`/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        title
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.title).toBe(title);
        expect(res.body.task.completed).toBe(false);
        expect(res.body.task.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
