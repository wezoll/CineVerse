import React from "react";
import "./ExternalLinks.css";

const ExternalLinks = ({ externalIds, type }) => {
  if (!externalIds) return null;

  const links = [];

  if (externalIds.imdb_id) {
    links.push({
      name: "IMDb",
      url: `https://www.imdb.com/title/${externalIds.imdb_id}/`,
      icon: "imdb",
    });
  }

  if (externalIds.facebook_id) {
    links.push({
      name: "Facebook",
      url: `https://www.facebook.com/${externalIds.facebook_id}`,
      icon: "facebook",
    });
  }

  if (externalIds.instagram_id) {
    links.push({
      name: "Instagram",
      url: `https://www.instagram.com/${externalIds.instagram_id}/`,
      icon: "instagram",
    });
  }

  if (externalIds.twitter_id) {
    links.push({
      name: "Twitter",
      url: `https://twitter.com/${externalIds.twitter_id}`,
      icon: "twitter",
    });
  }

  if (type === "movie" && externalIds.freebase_id) {
    links.push({
      name: "Freebase",
      url: `https://www.freebase.com/m/${externalIds.freebase_id}`,
      icon: "freebase",
    });
  }

  if (type === "tv" && externalIds.freebase_mid) {
    links.push({
      name: "Freebase",
      url: `https://www.freebase.com/m/${externalIds.freebase_mid}`,
      icon: "freebase",
    });
  }

  if (links.length === 0) return null;

  return (
    <div className="external-links">
      <h3>Внешние ссылки</h3>
      <div className="external-links-grid">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`external-link ${link.icon}`}
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ExternalLinks;
