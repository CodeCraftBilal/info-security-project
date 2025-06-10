'use server'
export async function uploadFileAction(formData: FormData) {
    console.log("files reached the server")
    console.log(formData);
}