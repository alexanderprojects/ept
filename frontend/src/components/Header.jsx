export default function Header({ showTotal }) {
    if (!showTotal) {
        return (
            <div className="card">
                <p><i>The official e-dating quiz that will evaluate your e-dating score. The questions cover all aspects of the online dating world, from the most common to the most extreme experiences. <u>Warning</u>: This quiz references self harm.</i> </p>
                <br />
                <p><b>Disclaimer: these questions <u>ONLY</u> apply to the online environment.<br />&apos;them&apos; refers to an online partner or love interest.</b></p>
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
