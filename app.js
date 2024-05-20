import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from 'cors';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
const app = express();
const server = createServer(app)
app.use(bodyParser.json());

app.use('/image', express.static('uploads'))
const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
    ],

    allowedHeaders: [
        'Content-Type',
    ],
}
app.use(cors(corsOpts));

mongoose.connect('mongodb+srv://jayeshp:qedoEwQVtUijFTAp@cluster0.vrgqok6.mongodb.net/Cluster0?retryWrites=true&w=majority')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    mobileno: String
}, { collection: 'login' });

const contactUs = new mongoose.Schema({
    name: String,
    email: String,
    mobileno: String,
    message: String
}, { collection: 'contactUs' });

const blog = new mongoose.Schema({
    content: String,
    image: String,
    title: String
}, { collection: 'blog' });


const category = new mongoose.Schema({
    author: String,
    image: String,
    price: Number,
    title: String
}, { collection: 'category' });

const addtocart = new mongoose.Schema({
    quantity: String,
    bookname: String,
    price: Number,
    bookimg: String,
    author: String
}, { collection: 'cart' });

const addtopayment =new mongoose.Schema({

},{collation:'payment'})



const LoginData = mongoose.model('LoginData', loginSchema);
const ContactUs = mongoose.model('ContactUs', contactUs);
const Blog = mongoose.model('blog', blog);
const Category = mongoose.model('category', category);
// const Addtocart = mongoose.model('cart', addtocart);
const Addtopayment = mongoose.model('payment', addtopayment);



app.get('/', (req, res) => {
    res.send('Welcome,Book Store!!');
});

app.post('/register', async (req, res) => {
    try {
        let body = req.body;
        let isUser = await LoginData.find({ username: body.username });
        let error = false;
        let data = {};
        if (isUser.length == 0) {
            if (!body.username) {
                data.username = "Please Enter Username";
                error = true;
            }
            if (!body.password) {
                data.password = "Please Enter Password";
                error = true;
            }
            if (!body.email) {
                data.password = "Please Enter Email";
                error = true;
            }
            if (!body.mobileno) {
                data.password = "Please Enter Mobile Number";
                error = true;
            }
            if (!error) {
                const newUser = new LoginData(body);
                const savedUser = await newUser.save();
                res.status(200).send({ code: 0, returnMessage: 'Register Successfully', data: savedUser })
            }
            else {
                res.status(400).send({ code: 1, error: data })
            }
        }
        else {
            res.send({ code: 1, returnMessage: "User Already Exist" })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

app.post('/login', async (req, res) => {
    try {
        let body = req.body;
        let isUser = await LoginData.findOne({ username: body.username });
        let data = {};
        let error = false;
        if (isUser) {
            if (!body.username) {
                data.username = "Please Enter Username";
                error = true;
            }
            if (!body.password) {
                data.password = "Please Enter Password";
                error = true;
            }
            if (!body.email) {
                data.password = "Please Enter Email";
                error = true;
            }
            if (!error) {
                res.status(200).send({ code: 0, returnMessage: 'Login Successfully' })
            }
            if (error) {
                res.status(400).send({ code: 1, error: data })
            }
        }
        else {
            res.send({ code: 1, returnMessage: "User Doesn't Exist" })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

app.post('/add-contact-data', async (req, res) => {
    try {
        let body = req.body;
        let data = {};
        let error = false;
        if (!body.message) {
            data.message = "Please Enter message";
            error = true;
        }
        if (!body.name) {
            data.name = "Please Enter name";
            error = true;
        }
        if (!body.mobileno) {
            data.mobileno = "Please Enter Mobile No";
            error = true;
        }
        if (!body.email) {
            data.email = "Please Enter email";
            error = true;
        }
        if (!error) {
            const newUser = new ContactUs(body);
            const savedUser = await newUser.save();
            res.status(200).send({ code: 0, returnMessage: 'Contact Successfully', data: savedUser })
        }
        if (error) {
            res.status(400).send({ code: 1, error: data })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

app.get('/get-blog', async (req, res) => {
    try {
        let BlogData = await Blog.find({});
        res.send({ code: 0, data: BlogData })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

app.get('/get-category', async (req, res) => {
    try {
        let CategoryData = await Category.find({});
        res.send({ code: 0, data: CategoryData })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.post('/add-to-cart', async (req, res) => {
    try {
        let body = req.body;
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.post('/change-password', async (req, res) => {
    try {
        let body = req.body;
        if (body.username) {
            const user = await LoginData.findOne({ username: body.username });
            if (body.newPassword) {
                if (body.newPassword == body.oldPassword) {
                    res.status(400).send({ code: 1, returnMessage: "Old And New Password Are Same!!!" })
                }
                else {
                    user.password = body.password;
                    const result = await LoginData.replaceOne({ username: body.username }, user);
                    res.status(200).send({ code: 0, returnMessage: "Password Changed Successfully" })
                }
            }
            else {
                res.status(400).send({ returnMessage: "Password Required!!!" })
            }

        }
        else {
            res.status(400).send({ returnMessage: "Username Required!!!" })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})



// Admin_Apis
const adminLoginSchema = new mongoose.Schema({
    username: String,
    password: String,
}, { collection: 'adminLogin' });
const AdminLoginData = mongoose.model('AdminLoginData', adminLoginSchema);

const addBook = new mongoose.Schema({
    bookname: String,
    price: String,
    imageUrl: String,
    type: String,
    author: String
}, { collection: 'book' });

const BookData = mongoose.model('BookData', addBook);

const addBookCategories = new mongoose.Schema({
    type: String,
    price: String,
    imageUrl: String,
    author: String
}, { collection: 'bookCategories' });
const BookCategoiesData = mongoose.model('BookCategoiesData', addBookCategories);

const addblog = new mongoose.Schema({
    content: String,
    imageUrl: String,
}, { collection: 'blog' });
const BlogsData = mongoose.model('BlogsData', addblog);

const addauthor = new mongoose.Schema({
    authorname: String,
}, { collection: 'author' });
const AuthorData = mongoose.model('AuthorData', addauthor);

function deleteImage(filename) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagePath = path.join(__dirname, 'uploads', filename);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return;
        }
    });
}



app.post('/Adminlogin', async (req, res) => {
    try {
        let body = req.body;
        let isUser = await AdminLoginData.findOne({ username: body.username });
        let data = {};
        let error = false;
        if (isUser) {
            if (!body.username) {
                data.username = "Please Enter Username";
                error = true;
            }
            if (!body.password) {
                data.password = "Please Enter Password";
                error = true;
            }
            if (!error) {
                res.status(200).send({ code: 0, data: isUser, returnMessage: 'Login Successfully' })
            }
            if (error) {
                res.status(400).send({ code: 1, error: data })
            }
        }
        else {
            res.send({ code: 1, returnMessage: "User Doesn't Exist" })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

app.post('/change-password', async (req, res) => {
    try {
        let body = req.body;
        if (body.username) {
            const user = await AdminLoginData.findOne({ username: body.username });
            if (body.newPassword) {
                if (body.newPassword == body.oldPassword) {
                    res.status(400).send({ code: 1, returnMessage: "Old And New Password Are Same!!!" })
                }
                else {
                    user.password = body.password;
                    const result = await AdminLoginData.replaceOne({ username: body.username }, user);
                    res.status(200).send({ code: 0, returnMessage: "Password Changed Successfully" })
                }
            }
            else {
                res.status(400).send({ returnMessage: "Password Required!!!" })
            }

        }
        else {
            res.status(400).send({ returnMessage: "Username Required!!!" })
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

//book :-
app.post('/book', upload.single('image'), (req, res) => {
    try {
        const { bookData } = req.body;
        const { bookname, price, type, author } = JSON.parse(bookData);
        const imageUrl = 'image/' + req.file.filename;
        const book = new BookData({ bookname, author, price, type, imageUrl });
        book.save();
        res.status(200).send({ code: 0, returnMessage: 'Book Added successfully' });
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
},);
app.get('/get-book', async (req, res) => {
    try {
        const book = await BookData.find({});
        res.status(200).send({ code: 0, data: book });
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
},);
app.post('/update-book', upload.single('image'), async (req, res) => {
    try {
        const { bookData } = req.body;
        const { id, type, price, author, originalFileName } = JSON.parse(bookData);
        let imageUrl;
        if (originalFileName) {
            if (req.file) {
                // Delete previous image if filename has changed
                if (originalFileName !== imageUrl) {
                    const imageName = originalFileName.split('/')
                    deleteImage(imageName[imageName.length - 1]);
                    imageUrl = 'image/' + req.file.filename;
                }
            } else {
                // Use existing image URL if no new image is uploaded
                imageUrl = originalFileName;
            }
            let data = await BookData.findByIdAndUpdate(id, { type, price, author, imageUrl });
            res.status(200).send({ code: 0, returnMessage: 'Book updated successfully' });
        } else {
            res.status(400).send('Missing originalFileName');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ code: 2, returnMessage: 'Something went wrong' });
    }
});
app.get('/Deletebook/:id', async (req, res) => {
    let id = req.params.id;
    try {
        if (id) {
            const user = await BookData.findOne({ _id: id });
            if (user) {
                const book = await BookData.findOneAndDelete({ _id: id });
                res.status(200).send({ code: 0, data: book, returnMessage: 'Deleted Successfully!' });
            }
            else {
                res.status(400).send({ code: 1, returnMessage: "User Doesn't Exist!" });
            }
        }
        else {
            res.status(400).send({ code: 1, returnMessage: 'Id Not Valid!!' });
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
});
//book-catgories:-
app.post('/book-catgories', upload.single('image'), async (req, res) => {
    try {
        const { bookCat } = req.body;
        const { type, price, author } = JSON.parse(bookCat);
        const imageUrl = 'image/' + req.file.filename;
        const bookCategores = await new BookCategoiesData({ type, price, author, imageUrl });
        bookCategores.save();
        res.status(200).send({ code: 0, returnMessage: 'Book Added successfully' });
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
});
app.post('/update-book-categories', upload.single('image'), async (req, res) => {
    try {
        const { bookCat } = req.body;
        const { id, type, price, author, originalFileName } = JSON.parse(bookCat);
        let imageUrl;
        if (originalFileName) {
            if (req.file) {
                // Delete previous image if filename has changed
                if (originalFileName !== imageUrl) {
                    const imageName = originalFileName.split('/')
                    deleteImage(imageName[imageName.length - 1]);
                    imageUrl = 'image/' + req.file.filename;
                }
            } else {
                // Use existing image URL if no new image is uploaded
                imageUrl = originalFileName;
            }
            let data = await BookCategoiesData.findByIdAndUpdate(id, { type, price, author, imageUrl });
            res.status(200).send({ code: 0, returnMessage: 'Book updated successfully' });
        } else {
            res.status(400).send('Missing originalFileName');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ code: 2, returnMessage: 'Something went wrong' });
    }
});

app.get('/get-book-catgories', upload.single('image'), async (req, res) => {
    try {
        let data = await BookCategoiesData.find({})
        res.status(200).send({ code: 0, data: data })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.get('/deletebookCategories/:id', async (req, res) => {
    let id = req.params.id;
    try {
        if (id) {
            const user = await BookCategoiesData.findOne({ _id: id });
            if (user) {
                const book = await BookCategoiesData.findOneAndDelete({ _id: id });
                res.status(200).send({ code: 0, data: book, returnMessage: 'Deleted Successfully!' });
            }
            else {
                res.status(400).send({ code: 1, returnMessage: "User Doesn't Exist!" });
            }
        }
        else {
            res.status(400).send({ code: 1, returnMessage: 'Id Not Valid!!' });
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
});
//Blog:-
app.post('/blog', upload.single('image'), (req, res) => {
    try {
        const { blogData } = req.body;
        const { content } = JSON.parse(blogData);
        const imageUrl = 'image/' + req.file.filename;
        const book = new BlogsData({ content, imageUrl });
        book.save();
        res.status(200).send({ code: 0, returnMessage: 'Blog Added successfully' });
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
},);
app.get('/get-blog', upload.single('image'), async (req, res) => {
    try {
        let data = await BlogsData.find({})
        res.status(200).send({ code: 0, data: data })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.post('/update-book-blog', upload.single('image'), async (req, res) => {
    try {
        const { blogData } = req.body;
        const { content, originalFileName, id } = JSON.parse(blogData);
        let imageUrl;
        if (originalFileName) {
            if (req.file) {
                // Delete previous image if filename has changed
                if (originalFileName !== imageUrl) {
                    const imageName = originalFileName.split('/')
                    deleteImage(imageName[imageName.length - 1]);
                    imageUrl = 'image/' + req.file.filename;
                }
            } else {
                // Use existing image URL if no new image is uploaded
                imageUrl = originalFileName;
            }
            let data = await BlogsData.findByIdAndUpdate(id, { content, imageUrl });
            res.status(200).send({ code: 0, returnMessage: 'Blog updated successfully' });
        } else {
            res.status(400).send('Missing originalFileName');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ code: 2, returnMessage: 'Something went wrong' });
    }
});
app.get('/deleteBlog/:id', async (req, res) => {
    let id = req.params.id;
    try {
        if (id) {
            const user = await BlogsData.findOne({ _id: id });
            if (user) {
                const blog = await BlogsData.findOneAndDelete({ _id: id });
                res.status(200).send({ code: 0, data: blog, returnMessage: 'Deleted Successfully!' });
            }
            else {
                res.status(400).send({ code: 1, returnMessage: "User Doesn't Exist!" });
            }
        }
        else {
            res.status(400).send({ code: 1, returnMessage: 'Id Not Valid!!' });
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
});
//Author:-
app.post('/author', async (req, res) => {
    try {
        const { authorname } = req.body;
        // if (bookcategories &&book) {
        const author = new AuthorData({ authorname });
        const savedUser = await author.save();
        res.status(200).send({ code: 0, returnMessage: 'Author Successfully', data: { authorname} })
        // }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.get('/get-author', async (req, res) => {
    try {
        let data = await AuthorData.find({});
        res.send({ code: 0, data: data })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
app.post('/update-Author', async (req, res) => {
    try {
        const {authorname, id } = req.body;
        let data = await AuthorData.findByIdAndUpdate(id, { authorname });
        console.log(data);
        res.status(200).send({ code: 0, returnMessage: 'Author updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send({ code: 2, returnMessage: 'Something went wrong' });
    }
});
app.get('/deleteAuthor/:id', async (req, res) => {
    let id = req.params.id;
    try {
        if (id) {
            const user = await AuthorData.findOne({ _id: id });
            if (user) {
                const authorData = await AuthorData.findOneAndDelete({ _id: id });
                res.status(200).send({ code: 0, data: authorData, returnMessage: 'Deleted Successfully!' });
            }
            else {
                res.status(400).send({ code: 1, returnMessage: "User Doesn't Exist!" });
            }
        }
        else {
            res.status(400).send({ code: 1, returnMessage: 'Id Not Valid!!' });
        }
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
});
//contact us:-
app.get('/get-contact-data', async (req, res) => {
    try {
        let contactData = await ContactUs.find({});
        res.send({ code: 0, data: contactData })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})
//payment:-
app.get('/get-payment', async (req, res) => {
    try {
        let PaymentData = await Addtopayment.find({});
        res.send({ code: 0, data: PaymentData })
    }
    catch {
        res.status(401).send({ code: 2, returnMessage: 'something went wrong' });
    }
})

//delete many data:-
// app.get('/', async (req, res) => {
//     let data = await ContactUs.deleteMany({});
//     console.log(data)
//     res.send({ data });
// })

app.listen(3000, () => {
    console.log('Server Is Running on Port 3000')
})
