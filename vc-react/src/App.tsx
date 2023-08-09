import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	MeetingProvider,
	MeetingConsumer,
	useMeeting,
	useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";

import "./app.css";
import { Button, Divider, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { VideoCall, Videocam, VideocamOff, Call, Mic, MicOff } from "@mui/icons-material";

function JoinScreen({
	getMeetingAndToken,
  creatingMeet
}: {
	getMeetingAndToken: (meeting?: string) => void;
  creatingMeet: boolean
}) {
	const [meetingId, setMeetingId] = useState<string | undefined>();
	const [isFocused, setIsFocused] = useState(false);
	const onClick = async () => {
		getMeetingAndToken(meetingId);
	};
	return (
		<div className="join-meeting">
			<LoadingButton
				variant={creatingMeet ? "text" : "contained"}
				className="create-btn"
				startIcon={<VideoCall />}
				onClick={onClick}
				loading={creatingMeet}
				disabled={creatingMeet}
			>
				New Meeting
			</LoadingButton>
			<Divider
				variant="fullWidth"
				sx={{
					backgroundColor: "#6D7886",
					marginTop: "15px",
					marginBottom: "15px",
				}}
			/>
			<div className="create-container">
				<input
					type="text"
					placeholder="Enter Meeting Id"
					onChange={(e) => {
						setMeetingId(e.target.value);
					}}
					className="id-input"
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>
				{isFocused || meetingId ? (
					<span
						onClick={meetingId ? onClick : undefined}
						className={`join-btn${!meetingId ? " disable" : ""}`}
					>
						Join
					</span>
				) : null}
			</div>
		</div>
	);
}

function ParticipantView({ participantId }: { participantId: string }) {
	const micRef = useRef<HTMLAudioElement>(null);
	const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
		useParticipant(participantId);

	const videoStream = useMemo(() => {
		if (webcamOn && webcamStream) {
			const mediaStream = new MediaStream();
			mediaStream.addTrack(webcamStream.track);
			return mediaStream;
		}
	}, [webcamStream, webcamOn]);

	useEffect(() => {
		if (micRef.current) {
			if (micOn && micStream) {
				const mediaStream = new MediaStream();
				mediaStream.addTrack(micStream.track);

				micRef.current.srcObject = mediaStream;
				micRef.current
					.play()
					.catch((error) =>
						console.error("videoElem.current.play() failed", error)
					);
			} else {
				micRef.current.srcObject = null;
			}
		}
	}, [micStream, micOn]);

	return (
		<div key={participantId} className="participant-container">
			<audio ref={micRef} autoPlay muted={isLocal} />
      <div className="video-container">
        <span className="name">{displayName}</span>
        <span className="mic-icon" style={{backgroundColor: micOn?"#3C62F0":"#1C242F"}} >{micOn?<Mic className="icon" />:<MicOff className="icon"/>}</span>
        {webcamOn ? (
          <ReactPlayer
            //
            playsinline // very very imp prop
            pip={false}
            light={false}
            controls={false}
            muted={true}
            playing={true}
            //
            url={videoStream}
            //
            height={"100%"}
            width={"100%"}
            style={{borderRadius: 10}}
            onError={(err) => {
              console.log(err, "participant video error");
            }}
          />
        )
      :
      <div className="no-video">
        <span className="avatar">{displayName.charAt(0)}</span>
      </div>}
      </div>
		</div>
	);
}

function Controls() {
	const { leave, toggleMic, toggleWebcam, localWebcamOn, localMicOn } = useMeeting();
	return (
		<div className="controls-container">
      <span className={`icon-btn${localWebcamOn?" active-btn":""}`} onClick={()=>toggleWebcam()}>{!localWebcamOn?<VideocamOff className="icon"/>:<Videocam className="icon"/>}</span>
      <span className="end-btn-container" onClick={()=>{leave()}} ><Call className="icon" /></span>
			<span className={`icon-btn${localMicOn?" active-btn":""}`} onClick={() => toggleMic()}>{!localMicOn?<MicOff className="icon"/>:<Mic className="icon"/>}</span>
		</div>
	);
}

function MeetingView({
	onMeetingLeave,
	meetingId,
}: {
	onMeetingLeave: () => void;
	meetingId: string;
}) {
	const [joined, setJoined] = useState<string | null>(null);
	//Get the method which will be used to join the meeting.
	//We will also get the participants list to display all participants
	const { join, participants } = useMeeting({
		//callback for when meeting is joined successfully
		onMeetingJoined: () => {
			setJoined("JOINED");
		},
		//callback for when meeting is left
		onMeetingLeft: () => {
			onMeetingLeave();
		},
	});
	const joinMeeting = () => {
		setJoined("JOINING");
		join();
	};

	return (
		<div className="container">
			<div className="id-container">
				<span className="title">Meeting Id</span>
				<span className="id">{meetingId}</span>
			</div>
			{joined && joined == "JOINED" ? (
				<div className="meeting-container" >
					{[...participants.keys()].map((participantId) => (
						<ParticipantView
							participantId={participantId}
							key={participantId}
						/>
					))}
					<Controls />
				</div>
			) : (
				<LoadingButton
          variant={joined==="JOINING" ? "text" : "contained"}
          className="create-btn"
          // startIcon={<VideoCall />}
          onClick={joinMeeting}
          loading={joined==="JOINING"}
          disabled={joined==="JOINING"}
          style={{width: "100%"}}
        >
          Join
        </LoadingButton>
			)}
		</div>
	);
}

function App() {
	const [meetingId, setMeetingId] = useState<string | null>();
	const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
	const [creatingMeet, setCreatingMeet] = useState(false);

	//Getting the meeting id by calling the api we just wrote
	const getMeetingAndToken = async (id?: string) => {
    if(!name) {
      nameRef.current?.focus();
      nameRef.current?.style.setProperty("border", "1px solid #dd5d5d");
      return;
    };
    setCreatingMeet(true);
		const meetingId =
			id == null ? await createMeeting({ token: authToken }) : id;
		setMeetingId(meetingId);
	};

	//This will set Meeting Id to null when meeting is left or ended
	const onMeetingLeave = () => {
		setMeetingId(null);
    setCreatingMeet(false);
	};

	return (
		<div className="main-container">
			{authToken && meetingId ? (
				<MeetingProvider
					config={{
						meetingId,
						micEnabled: true,
						webcamEnabled: true,
						name: name,
					}}
					token={authToken}
				>
					<MeetingView
						meetingId={meetingId}
						onMeetingLeave={onMeetingLeave}
					/>
				</MeetingProvider>
			) : (
				<>
					<div className="create-container">
						<input
							type="text"
							placeholder="Your Name"
							onChange={(e) => {
								setName(e.target.value);
							}}
							className="id-input"
              ref={nameRef}
              value={name}
						/>
					</div>
					<JoinScreen getMeetingAndToken={getMeetingAndToken} creatingMeet={creatingMeet}/>
				</>
			)}
		</div>
	);
}

export default App;
