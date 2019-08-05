import app from "./app";
const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`running graphql server on port ${port}`);
});