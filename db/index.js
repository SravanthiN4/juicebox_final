const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/juicebox-dev-final');


async function getAllUsers() {
    const {rows} = await client.query(`
        select id,username, name, location, active 
        from users;
    `)
    return rows;
    
}

async function getAllPosts() {
    const {rows} = await client.query(`
        select "authorId",title,content 
        from posts;
    `)
    return rows;
    
}

async function getPostsByUser(userId) {
    try {
      const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
      `);
  
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async function getUserById(userId) {
      const {rows} = await client.query(`
        select * from users 
        where id = ${userId}
      `);
      if(rows.length === 0) {
          return null;
      } else {
          delete rows.password;
            console.log(rows)
          rows.posts =  await getPostsByUser(1);
      }
      return rows;
  }

async function createUser({username,password, name, location}) {
    try {
        const {rows} = await client.query(`
        INSERT INTO users(username, password,name,location) VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
`, [ username, password, name, location ]);
        return rows;
    } catch (error) {
        throw error;
    }
}

async function createPosts({authorId, title, content}) {
    try {
        const {rows} = await client.query(`
            INSERT INTO posts("authorId", title, content) VALUES ($1, $2, $3) 
            RETURNING *;
        `, [authorId, title,content])
    } catch(error) {
        throw error
    }
}

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const {rows:[user]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function updatePosts(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const {rows:[posts]} = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return posts;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    getAllPosts,
    createPosts,
    updatePosts,
    getPostsByUser,
    getUserById
}