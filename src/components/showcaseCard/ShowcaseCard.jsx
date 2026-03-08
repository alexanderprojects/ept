//ad showcase card - carousel of ads with create and view functionality
import { useEffect, useRef, useState } from "react";
import './ShowcaseCard.css';
import CreateAdModal from "../adModal/CreateAdModal";
import ads from '../../data/ads.json';

export default function ShowcaseCard() {

    // Display ONLY the first ad from the ads.json for now, we can implement carousel logic later
    const ad = ads[0];

    // Modal states
    const [showCreateAdModal, setShowCreateAdModal] = useState(false);

    return (
        <div className="showcase-card showcase-wrapper">

            {/* CONDITIONAL STATES */}
            {!ads.length ? (
                <div>No ads available.</div>
            ) : (
                <>
                    {/* AD SECTION */}
                    <div className="showcase-bottom-row">
                        <div className="showcase-content">
                            <div className="showcase-ad-message">{ad.Message}</div>
                            {ad.Link ? (
                                <a
                                    className="showcase-ad-link showcase-view-button"
                                    href={typeof ad.Link === "string" ? ad.Link : ad.Link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {typeof ad.Link === "string" ? ad.Link : (ad.Link.text || ad.Link.url)}
                                </a>
                            ) : (
                                <span className="showcase-ad-link-anonymous">Anonymous</span>
                            )}
                        </div>
                    </div>

                </>)
            }
            <div className="showcase-top-row">
                <h4 className="showcase-title">Ad Board</h4>
                <div className="showcase-button" onClick={() => setShowCreateAdModal(true)}>+ create</div>

            </div>

            {
                showCreateAdModal && <CreateAdModal onClose={() => setShowCreateAdModal(false)} />
            }
        </div >
    );
}