import React from 'react';

import { useNavigate, Link } from 'react-router-dom'; // COMBINED into a single import

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#172337] text-white font-sans">
      <div className="flex flex-wrap justify-between px-10 pt-8 pb-4 border-b border-[#2b3642]">
        {/* ABOUT */}
        <div className="min-w-[160px] mb-6">
          <h4 className="text-sm text-[#878787] mb-3">ABOUT</h4>
          <div className="text-xs leading-6">

            {/*
              SONARLINT S6848 & S1082:
              Problem: 'div' elements with onClick handlers are not natively interactive
                       and lack accessibility features (keyboard listener, role).
              Solution: Use 'Link' components or 'button' elements for navigation/interaction.
                        Since these are for internal navigation, 'Link' is the most appropriate.
            */}
            <Link to="/contact" className="block cursor-pointer hover:underline">
              Contact Us
            </Link>

            <Link to="/about" className="block cursor-pointer hover:underline">
              About Us
            </Link>
            {/*
              For the remaining items in 'ABOUT' section, if they are meant to be navigation links,
              they should also be 'Link' components. If they are just static text or placeholders,
              they are fine as 'div' elements without click handlers.
              Assuming they are static for now, as no `onClick` or `to` prop is present.
            */}
            <div>Careers</div>
            <div>SuperMarket Stories</div>
            <div>Press</div>
            <div>Corporate Information</div>
          </div>
        </div>

        {/* GROUP COMPANIES */}
        <div className="min-w-[160px] mb-6">
          <h4 className="text-sm text-[#878787] mb-3">GROUP COMPANIES</h4>
          <div className="text-xs leading-6">
            <a
              href="https://www.myntra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:underline"
            >
              Myntra
            </a>
            <a
              href="https://www.cleartrip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:underline"
            >
              Cleartrip
            </a>
            <a
              href="https://www.shopsy.in"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:underline"
            >
              Shopsy
            </a>
          </div>
        </div>


        {/* HELP */}
        <div className="min-w-[160px] mb-6">
          <h4 className="text-sm text-[#878787] mb-3">HELP</h4>
          <div className="text-xs leading-6">
            {/* Assuming these are static text entries for now */}
            <div>Payments</div>
            <div>Shipping</div>
            <div>Cancellation & Returns</div>
            <div>FAQ</div>
          </div>
        </div>

        {/* CONSUMER POLICY */}
        <div className="min-w-[200px] mb-6">
          <h4 className="text-sm text-[#878787] mb-3">CONSUMER POLICY</h4>
          <div className="text-xs leading-6">
            {/* Assuming these are static text entries for now */}
            <div>Cancellation & Returns</div>
            <div>Terms Of Use</div>
            <div>Security</div>
            <div>Privacy</div>
            <div>Sitemap</div>
            <div>Grievance Redressal</div>
            <div>EPR Compliance</div>
          </div>
        </div>

        {/* MAIL US */}
        <div className="min-w-[250px] mb-6 border-l border-[#454d5e] pl-8">
          <h4 className="text-sm text-[#878787] mb-3">Mail Us:</h4>
          <div className="text-xs leading-[1.7]">
            SuperMarket Internet Private Limited,<br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Chhouma, 560103,<br />
            Mathura, India
          </div>
          <div className="mt-4">
            <span className="text-sm text-[#878787]">Social</span>
            <div className="mt-2 flex gap-3 text-lg">
              {/*
                SONARLINT S6844:
                Problem: href="#" is not a valid navigable address and can cause accessibility issues.
                Solution: Provide actual URLs or use button elements if they are not links.
                          For social media, actual URLs are expected.
              */}
              <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white">&#xf09a;</a>
              <a href="https://www.twitter.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white">&#xf099;</a>
              <a href="https://www.youtube.com/yourchannel" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white">&#xf16a;</a>
              <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white">&#xf16d;</a>
            </div>
          </div>
        </div>

        {/* REGISTERED OFFICE */}
        <div className="min-w-[250px] mb-6">
          <h4 className="text-sm text-[#878787] mb-3">Registered Office Address:</h4>
          <div className="text-xs leading-[1.7]">
            SuperMarket Internet Private Limited,<br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103,<br />
            Karnataka, India<br />
            CIN : U51109KA2012PTC066107<br />
            Telephone: <a href="tel:+916399003541" className="text-[#2874f0]">+91 6399003541</a> / <a href="tel:+917456063501" className="text-[#2874f0]">+91 7456063501</a>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap justify-between items-center px-10 py-4 text-sm">
        <div className="flex flex-wrap gap-8">

          <Link to="/seller-onboarding" className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-yellow-400 text-lg">&#128188;</span> Become a Seller
          </Link>

          {/*
            SONARLINT S6848 & S1082:
            Problem: These are 'div' elements with visual cues that look like interactive links/buttons
                     but lack proper accessibility.
            Solution: If they are meant to be clickable and lead somewhere, use Link or button.
                      If they are just descriptive text, remove the `cursor-pointer` (which isn't there, good)
                      and ensure they don't imply interactivity.
                      Assuming "Advertise" and "Gift Cards" might navigate or trigger actions,
                      I'm converting them to `<button>` with a placeholder `onClick`.
                      If they are meant to be links, use <Link> with a 'to' prop.
          */}
          <Link to="/under-construction" className="flex items-center gap-2 cursor-pointer hover:underline">
  <span className="text-yellow-400 text-lg">&#11088;</span> Advertise
</Link>

<Link to="/under-construction" className="flex items-center gap-2 cursor-pointer hover:underline">
  <span className="text-yellow-400 text-lg">&#127873;</span> Gift Cards
</Link>

          <Link to="/helpcenter" className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-yellow-400 text-lg">&#128188;</span> Help Center
          </Link>

        </div>
        <div className="text-[#878787]">© 2025 - 2027 SuperMarket.com</div>
        <div className="flex gap-1">
          <img src="https://img.icons8.com/color/36/000000/visa.png" alt="Visa" />
          <img src="https://img.icons8.com/color/36/000000/mastercard-logo.png" alt="Mastercard" />
          <img src="https://img.icons8.com/color/36/000000/amex.png" alt="Amex" />
          <img src="https://img.icons8.com/color/36/000000/discover.png" alt="Discover" />
          <img src="https://img.icons8.com/color/36/000000/rupay.png" alt="Rupay" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
