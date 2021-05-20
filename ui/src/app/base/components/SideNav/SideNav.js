import classNames from "classnames";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

const _generateSection = (section, location) => {
  let subNav = null;

  if (section.subNav && section.subNav.length) {
    const subsections = section.subNav.map((subsection) => {
      const subPath = subsection.path;
      const isActive = location.pathname === subPath;
      return (
        <li className="p-side-navigation__item" key={subPath}>
          <Link
            to={subPath}
            className={classNames("p-side-navigation__link", {
              "is-active": isActive,
            })}
          >
            {subsection.label}
          </Link>
        </li>
      );
    });
    subNav = <ul className="p-side-navigation__list">{subsections}</ul>;
  }

  if (section.path) {
    const path = section.path;
    let isActive;
    if (!section.subNav) {
      isActive = location.pathname.startsWith(path);
    } else {
      isActive = location.pathname === path;
    }
    return (
      <li className="p-side-navigation__item--title" key={path}>
        <Link
          to={path}
          className={classNames("p-side-navigation__link", {
            "is-active": isActive,
          })}
        >
          {section.label}
        </Link>
        {subNav}
      </li>
    );
  }

  return (
    <li className="p-side-navigation__item" key={section.label}>
      <span className="p-side-navigation__text p-side-navigation__item--title">
        {section.label}
      </span>
      {subNav}
    </li>
  );
};

export const SideNav = ({ items }) => {
  const location = useLocation();
  const sections = items.map((item) => _generateSection(item, location));
  return (
    <nav className="p-side-navigation">
      <ul className="p-side-navigation__list">{sections}</ul>
    </nav>
  );
};

SideNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      subNav: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default SideNav;
