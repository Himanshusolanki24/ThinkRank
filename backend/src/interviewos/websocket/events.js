const websocketEvents = {
    clientToServer: [
        "session.join",
        "session.ready",
        "audio.chunk",
        "transcript.partial",
        "editor.change",
        "editor.run",
        "editor.submit",
        "presence.visibility",
        "presence.focus",
        "integrity.signal",
        "camera.frame.meta",
        "heartbeat"
    ],
    serverToClient: [
        "session.bootstrap",
        "problem.presented",
        "interviewer.speaking",
        "interviewer.interrupt",
        "transcript.final",
        "evaluation.partial",
        "evaluation.round_complete",
        "integrity.warning",
        "integrity.status",
        "session.timer",
        "session.complete",
        "report.ready"
    ]
};

module.exports = {
    websocketEvents
};
