import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectAuth, LoginStatus } from "../Login/authslice";

export function Note() {
  const auth = useAppSelector(selectAuth);
  // Assign the user notes to a useState 'userNote' variable
  const [userNote, setUserNote] = useState("")
  
  useEffect(() => {
    const fetchNote = async () => {
      // if the user isn't logged in, it will only return an auth object with status inside
      // Adding this means the fetch below will only work once a user is logged in and the object is populated with user and apiToken
      if (auth.status) return

      // fetch the users data based on the userId assigned once the user logs in
      const getNote = await fetch(`https://60b793ec17d1dc0017b8a6bc.mockapi.io/users/${userId}`)
      const noteJson = await getNote.json()
      // set the note data to the 'userNote' useState variable
      setUserNote(noteJson['note'])
    }

    fetchNote()
    // useEffect only renders  at first render and when auth state changes
  }, [auth])


  if (auth.status !== LoginStatus.LOGGED_IN) return null;
  const {
    apiToken,
    user: { id: userId },
  } = auth;

  return (
    <div>
      {/* Pass in apiToken and userId to the NoteField component */}
      <NoteField apiToken={apiToken} userId={userId} />
      {/* Display the user note below the input field */}
      {userNote}
    </div>
  );
}

// Retreive the apiToken and userId from the parent to the NoteField child
function NoteField({ apiToken, userId }: { apiToken: any, userId: any }) {
  // Initialise note useState variable (for controlled form) and error useState variable to display connection error
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  // This is for when the user presses the submit button
  const submitNoteForm = async (e: any) => {
    e.preventDefault()

    // Assign the textarea value into the "note" key
    // "note" is what the key is called inside the API
    const body = {
      "note": note
    }

    // When the connection drops after 2000 ms (2 seconds), it will abort and give error
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2000);

    const options = {
      // PUT request to update the API 
      method: 'PUT',
      body: JSON.stringify(body),
      // Set content type and Authoriztion using a Bearer token
      headers: { "Content-type": "application/json", "Authorization": `Bearer ${apiToken}` },
      // Add the abort controller to the fetch request
      signal: controller.signal
    }

    // If the fetch passes, it will reload so the user can login again and check their note
    try {
      await fetch(`https://60b793ec17d1dc0017b8a6bc.mockapi.io/users/${userId}`, options)

      window.location.reload()

      // If the fetch fails, it will set the error useState variable to the below 
    } catch (e) {
      setError("Network error - please check your internet connection before sending a note!")
    }



  }


  return (
    <div>
      {/* The error will be set above the form */}
      <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      {/* a form is added with an onSubmit targetting the 'submitNoteForm' function which is shown above */}
      <form onSubmit={submitNoteForm}>
        {/* With every change to the textarae, it is assigned to the 'note' useState variable */}
        <textarea name="note" onChange={(e) => setNote(e.target.value)}></textarea>
        {/* Button to submit the form */}
        <button type="submit">Submit</button>
      </form>


    </div>
  )
}
