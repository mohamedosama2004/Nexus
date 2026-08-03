import { Post } from "../definitions";

export async function getProjects() {
    const response =await fetch ("https://jsonplaceholder.typicode.com/posts") 
    if(!response.ok) {
        throw new Error ("cannot fetch data")
    }
    const posts :Post[]= await response.json() ;
    return posts 
}