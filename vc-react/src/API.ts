//Auth token we will use to generate a meeting and connect to it
export const authToken: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIyZjAwOWUyZi00NzE4LTRkODYtODhhOS03YjlhN2FiNDc0YzYiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5MTUyMzI3MCwiZXhwIjoxNzA3MDc1MjcwfQ.GW4ZRsasiXcbjoi6n0bbsgpJswdDmI1tG6j-zKbF6Lc";

// API call to create meeting
export const createMeeting = async ({ token }: { token: string }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  //Destructuring the roomId from the response
  const { roomId }: { roomId: string } = await res.json();
  return roomId;
};