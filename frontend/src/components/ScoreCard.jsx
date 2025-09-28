export default function ScoreCard({ total }) {
    return (
        <div className="card">
            <p><b>Your E-Dating Love Score:</b></p>
            <br />
            <h1 className="score-value">{total}</h1>
            <p style={{ color: "#EC83A8" }}>──── ౨ৎ ────</p>
            <br />
            <p style={{ color: "#EC83A8" }}><i> The score represents the total amount of questions you answered &quot;yes&quot; to.</i></p>
        </div>
    )
}
