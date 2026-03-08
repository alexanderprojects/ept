// header card
export default function Header({ showTotal }) {
    if (!showTotal) {
        return (
            <div className="card">
                <p><i>The official e-dating quiz that will evaluate your e-dating score. The questions cover all aspects of the online dating world, from the most common to the most extreme experiences.</i></p>
                <br />
                <p><b>Disclaimer: &apos;them&apos; refers to an online partner or love interest.</b></p>
                <br />
                <p>Click on every item you have done.</p>
            </div>
        )
    } else {
        return (
            <div className="card">
                <p><i>The official e-dating quiz that will evaluate your e-dating score. The questions cover all aspects of the online dating world, from the most common to the most extreme experiences.</i></p>
            </div>
        )
    }
}
