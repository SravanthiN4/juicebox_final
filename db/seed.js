// db/seed.js

const { user } = require('pg/lib/defaults');
const {
    client,
    getAllUsers,
    createUser,
    updateUser,
    getAllPosts,
    createPosts,
    updatePosts,
    getPostsByUser,
    getUserById
  } = require('./index');

 
  
  async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      await client.query(`
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }
  
  async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true

        );
      `);

      console.log("Finished building tables!");

      await client.query(`
        CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
        );

      `);

      console.log("Finished building posts tables!");
  
      
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }
  
  async function createInitialUsers() {
    try {
        console.log("Starting to create users...");
        await createUser({ username: 'albert', password: 'bertie99', name: 'AL BERT', location: 'Sidney, Australia'});
        await createUser({ username: 'sandra', password: '2sandy4me',name: 'Just Sandra', location: "Ain't telling'" });
        await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });
        
        console.log("finished creating users!");

    } catch (error) {
        console.error("Error creating users!");
        throw error;
        
    }
}


async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPosts({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
  
      // a couple more
    } catch (error) {
      throw error;
    }
  }

async function createPostContent() {
    try {
        console.log("Starting to create posts..");
        await createPosts({authorId:1,title:'My First Post', content:"Test first content"})
        await createPosts({authorId:2,title:'My Second Post', content:"Test second content"})
        await createPosts({authorId:3,title:'My Third Post', content:"Test third content"})
        
    } catch (error) {
        console.error("Error creating posts!");
        throw error;
    }
}

async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createPostContent();
      await createInitialPosts();
    } catch (error) {
      throw error;
    }
  }
  
  async function testDB() {
    try {
      console.log("Starting to test database...");
      console.log("Calling getAllUsers")
  
      const users = await getAllUsers();
      console.log("Result:", users);

      console.log("Calling updateUser on users[0]")

      
   const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"

      
    });
    console.log("Result:", updateUserResult);

    
    console.log("Calling getAllPosts")
    
    const posts = await getAllPosts();
      console.log("Posts",posts);

      
      console.log("Calling updatePost on posts[0]")
      const updatePostResult = await updatePosts(posts[0].authorId, {
          title: "Updated First Title",
          content: "Updated First content",
          active: false
      })

      console.log("PostUpdate", updatePostResult);

      console.log("Calling postsbyUser....")

      const grabbedUser = 1;
      const postsByUser = await getPostsByUser(grabbedUser);
      console.log("PostsbyUser", postsByUser);

      console.log("Calling getuserbyid....")
      const userById = await getUserById(grabbedUser);
      
      console.log("userById", userById);
  
      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }
  
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());