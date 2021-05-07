import PropTypes from "prop-types";
import React, { useEffect } from "react";

import { BASENAME } from "../../utils";
import type { UsabillaLive } from "../../types";

declare global {
  export interface Window {
    usabilla_live: UsabillaLive;
    lightningjs: {
      require: (variable: string, url: string) => Window["usabilla_live"];
    };
  }
}

type Props = {
  debug?: boolean;
  enableAnalytics?: boolean;
  version: string;
};

export const Footer = ({
  debug,
  enableAnalytics,
  version,
}: Props): JSX.Element => {
  useEffect(() => {
    if (!debug && enableAnalytics && version) {
      // Inject the the Usabilla script.
      // prettier-ignore
      // @ts-ignore
      // eslint-disable-next-line
      window.lightningjs||function(c){function g(b,d){d&&(d+=(/\?/.test(d)?"&":"?")+"lv=1");c[b]||function(){var i=window,h=document,j=b,g=h.location.protocol,l="load",k=0;(function(){function b(){a.P(l);a.w=1;c[j]("_load")}c[j]=function(){function m(){m.id=e;return c[j].apply(m,arguments)}var b,e=++k;b=this&&this!=i?this.id||0:0;(a.s=a.s||[]).push([e,b,arguments]);m.then=function(b,c,h){var d=a.fh[e]=a.fh[e]||[],j=a.eh[e]=a.eh[e]||[],f=a.ph[e]=a.ph[e]||[];b&&d.push(b);c&&j.push(c);h&&f.push(h);return m};return m};var a=c[j]._={};a.fh={};a.eh={};a.ph={};a.l=d?d.replace(/^\/\//,(g=="https:"?g:"http:")+"//"):d;a.p={0:+new Date};a.P=function(b){a.p[b]=new Date-a.p[0]};a.w&&b();i.addEventListener?i.addEventListener(l,b,!1):i.attachEvent("on"+l,b);var q=function(){function b(){return["<head></head><",c,' onload="var d=',n,";d.getElementsByTagName('head')[0].",d,"(d.",g,"('script')).",i,"='",a.l,"'\"></",c,">"].join("")}var c="body",e=h[c];if(!e)return setTimeout(q,100);a.P(1);var d="appendChild",g="createElement",i="src",k=h[g]("div"),l=k[d](h[g]("div")),f=h[g]("iframe"),n="document",p;k.style.display="none";e.insertBefore(k,e.firstChild).id=o+"-"+j;f.frameBorder="0";f.id=o+"-frame-"+j;/MSIE[ ]+6/.test(navigator.userAgent)&&(f[i]="javascript:false");f.allowTransparency="true";l[d](f);try{f.contentWindow[n].open()}catch(s){a.domain=h.domain,p="javascript:var d="+n+".open();d.domain='"+h.domain+"';",f[i]=p+"void(0);"}try{var r=f.contentWindow[n];r.write(b());r.close()}catch(t){f[i]=p+'d.write("'+b().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};a.l&&setTimeout(q,0)})()}();c[b].lv="1";return c[b]}var o="lightningjs",k=window[o]=g(o);k.require=g;k.modules=c}({});
      window.usabilla_live = window.lightningjs.require("usabilla_live", "//w.usabilla.com/d296ba4422d2.js"); // prettier-ignore
      // Hide Usabilla default button
      window.usabilla_live("hide");
      // Add MAAS version to the custom data
      window.usabilla_live("data", { custom: { "MAAS version": version } });
    }
  }, [debug, enableAnalytics, version]);

  return (
    <footer className="p-strip--light is-shallow p-footer">
      <div className="row">
        <div className="col-10 p-footer__nav">
          <ul className="p-inline-list--middot">
            <li className="p-inline-list__item">
              <a href={`${BASENAME}/docs/`} className="p-footer__link">
                Local documentation
              </a>
            </li>
            <li className="p-inline-list__item">
              <a href="https://www.ubuntu.com/legal" className="p-footer__link">
                Legal information
              </a>
            </li>
            {!debug && enableAnalytics ? (
              <li className="p-inline-list__item">
                {/* eslint-disable-next-line */}
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    window.usabilla_live("click");
                  }}
                >
                  Give feedback
                </a>
              </li>
            ) : null}
          </ul>
          <p className="u-remove-max-width">
            &copy; {new Date().getFullYear()} Canonical Ltd. Ubuntu and
            Canonical are registered trademarks of Canonical Ltd.
          </p>
        </div>
        <div className="col-2">
          <svg
            className="p-footer__logo u-float--right"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-0.835 -0.92 761 101"
          >
            <path
              fill="#772953"
              d="M44.674 99.213c-6.67 0-12.744-1.096-18.226-3.288-5.481-2.193-10.188-5.413-14.114-9.661-3.93-4.248-6.968-9.432-9.113-15.554C1.073 64.591 0 57.555 0 49.606c0-7.948 1.187-15.005 3.563-21.172 2.374-6.166 5.618-11.35 9.729-15.553 4.111-4.201 8.86-7.4 14.252-9.594C32.934 1.097 38.645 0 44.674 0c4.111 0 7.788.273 11.031.822 3.242.548 6.051 1.188 8.428 1.918 2.374.732 4.293 1.463 5.755 2.193 1.461.732 2.467 1.279 3.016 1.644l-3.975 10.964c-.822-.549-2.01-1.142-3.562-1.782-1.555-.638-3.357-1.278-5.413-1.919-2.056-.637-4.316-1.164-6.783-1.576-2.466-.41-5.07-.616-7.811-.616-4.659 0-8.907.87-12.744 2.604-3.838 1.737-7.126 4.248-9.867 7.537-2.74 3.29-4.864 7.287-6.372 11.991-1.507 4.706-2.261 9.982-2.261 15.827 0 5.666.662 10.827 1.987 15.486 1.322 4.659 3.333 8.656 6.029 11.99 2.693 3.336 6.029 5.916 10.003 7.743 3.975 1.828 8.655 2.74 14.047 2.74 6.029 0 11.031-.639 15.005-1.919 3.975-1.278 6.965-2.419 8.976-3.426l3.426 10.963c-.64.458-1.781 1.028-3.426 1.713s-3.7 1.35-6.167 1.986c-2.466.639-5.344 1.187-8.633 1.646-3.289.456-6.852.684-10.689.684zM129.086 2.193a565.955 565.955 0 019.456 20.761 858.043 858.043 0 019.112 21.993 1249.74 1249.74 0 019.388 24.324 3288.944 3288.944 0 0110.277 27.887h-14.526a389.75 389.75 0 01-4.385-12.195 1027.33 1027.33 0 00-4.248-12.196h-43.029l-8.633 24.392H78.657a3156.414 3156.414 0 0110.277-27.887c3.197-8.54 6.325-16.649 9.388-24.324a858.043 858.043 0 019.112-21.993 567.62 567.62 0 019.455-20.761h12.197zm-6.44 15.21a353.539 353.539 0 00-9.113 21.378 768.367 768.367 0 00-8.564 23.159h35.355a1533.387 1533.387 0 00-8.702-23.091 412.74 412.74 0 00-8.976-21.446zM245.839 97.158a751.983 751.983 0 00-6.92-11.374 469.329 469.329 0 00-8.429-13.087 836.532 836.532 0 00-9.387-13.771c-3.243-4.66-6.463-9.16-9.661-13.499s-6.303-8.429-9.317-12.266-5.804-7.216-8.359-10.141v74.136h-13.018V2.193h10.551c4.294 4.568 8.884 9.889 13.772 15.964 4.886 6.076 9.729 12.333 14.525 18.773s9.318 12.768 13.566 18.98c4.248 6.214 7.833 11.74 10.758 16.581V2.193h13.018v94.964h-11.099zM453.309 97.158a760.278 760.278 0 00-6.92-11.374 473.855 473.855 0 00-8.428-13.087 849.214 849.214 0 00-9.387-13.771c-3.244-4.66-6.465-9.16-9.662-13.499s-6.303-8.429-9.318-12.266c-3.014-3.837-5.803-7.216-8.359-10.141v74.136h-13.018V2.193h10.551c4.295 4.568 8.885 9.889 13.773 15.964 4.887 6.076 9.729 12.333 14.525 18.773s9.318 12.768 13.566 18.98c4.248 6.214 7.832 11.74 10.758 16.581V2.193h13.018v94.964h-11.099zM488.525 2.193h13.293v94.964h-13.293V2.193zM566.771 99.213c-6.67 0-12.744-1.096-18.227-3.288-5.48-2.193-10.188-5.413-14.113-9.661-3.93-4.248-6.969-9.432-9.113-15.554-2.146-6.119-3.221-13.155-3.221-21.104 0-7.948 1.188-15.005 3.562-21.172 2.375-6.166 5.619-11.35 9.73-15.553 4.111-4.201 8.861-7.4 14.252-9.594C555.031 1.097 560.742 0 566.771 0c4.111 0 7.787.273 11.031.822 3.242.548 6.051 1.188 8.428 1.918 2.375.732 4.293 1.463 5.756 2.193 1.459.732 2.467 1.279 3.014 1.644l-3.973 10.964c-.822-.549-2.012-1.142-3.564-1.782-1.555-.638-3.357-1.278-5.412-1.919-2.055-.637-4.316-1.164-6.783-1.576-2.467-.41-5.07-.616-7.811-.616-4.658 0-8.908.87-12.744 2.604-3.838 1.737-7.125 4.248-9.867 7.537-2.74 3.29-4.865 7.287-6.371 11.991-1.508 4.706-2.262 9.982-2.262 15.827 0 5.666.662 10.827 1.986 15.486s3.334 8.656 6.029 11.99c2.693 3.336 6.029 5.916 10.004 7.743 3.975 1.828 8.656 2.74 14.047 2.74 6.029 0 11.031-.639 15.006-1.919 3.973-1.278 6.965-2.419 8.975-3.426l3.426 10.963c-.641.458-1.781 1.028-3.426 1.713s-3.699 1.35-6.166 1.986c-2.467.639-5.344 1.187-8.633 1.646-3.289.456-6.852.684-10.69.684zM651.184 2.193a567.66 567.66 0 019.457 20.761 858.114 858.114 0 019.111 21.993 1243.165 1243.165 0 019.389 24.324 3359.473 3359.473 0 0110.277 27.887h-14.527a392.32 392.32 0 01-4.385-12.195 1009.71 1009.71 0 00-4.248-12.196H623.23l-8.635 24.392h-13.84a3094.075 3094.075 0 0110.277-27.887c3.197-8.54 6.326-16.649 9.387-24.324a857.972 857.972 0 019.113-21.993 564.26 564.26 0 019.455-20.761h12.197zm-6.44 15.21a352.267 352.267 0 00-9.113 21.378 765.652 765.652 0 00-8.564 23.159h35.355a1533.218 1533.218 0 00-8.703-23.091 411.007 411.007 0 00-8.975-21.446zM759.988 86.058v11.1h-57.143V2.193h13.293v83.865h43.85zM322.58 81.194c-17.445 0-31.587-14.138-31.587-31.587 0-17.446 14.142-31.586 31.587-31.586 17.446 0 31.587 14.14 31.587 31.586 0 17.449-14.141 31.587-31.587 31.587z"
            />
            <path
              fill="#772953"
              d="M372.186 49.608c0 27.396-22.21 49.605-49.606 49.605-27.398 0-49.606-22.21-49.606-49.605 0-27.397 22.208-49.606 49.606-49.606 27.396-.001 49.606 22.208 49.606 49.606zm-49.607-37.54c-20.734 0-37.539 16.808-37.539 37.54 0 20.735 16.805 37.538 37.539 37.538s37.539-16.803 37.539-37.538c0-20.733-16.805-37.54-37.539-37.54z"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  debug: PropTypes.bool,
  enableAnalytics: PropTypes.bool,
  version: PropTypes.string.isRequired,
};

export default Footer;
