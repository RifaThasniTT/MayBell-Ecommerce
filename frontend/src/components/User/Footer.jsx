import React from 'react';
import companyLogo from '../../assets/images/company-logo.svg'
import githubIcon from '../../assets/images/github.svg'
import linkedinIcon from '../../assets/images/linkedin.svg'
import telegramIcon from '../../assets/images/telegram.svg'

const UserFooter = () => {
  return (
    <div>
      {/* Desktop Footer */}
      <footer className="mx-auto w-full max-w-[1200px] justify-between pb-10 flex flex-col lg:flex-row">
        <div className="ml-5">
          <img
            className="mt-10 mb-5"
            src={companyLogo}
            alt="company logo"
          />
          <p className="pl-0">
            Lorem ipsum dolor sit amet consectetur <br />
            adipisicing elit.
          </p>
          <div className="mt-10 flex gap-3">
            <a href="https://github.com/bbulakh">
              <img
                className="h-5 w-5 cursor-pointer"
                src={githubIcon}
                alt="github icon"
              />
            </a>
            <a href="https://t.me/b_bulakh">
              <img
                className="h-5 w-5 cursor-pointer"
                src={telegramIcon}
                alt="telegram icon"
              />
            </a>
            <a href="https://www.linkedin.com/in/bogdan-bulakh-393284190/">
              <img
                className="h-5 w-5 cursor-pointer"
                src={linkedinIcon}
                alt="linkedin icon"
              />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="mx-5 mt-10">
            <p className="font-medium text-gray-500">FEATURES</p>
            <ul className="text-sm leading-8">
              <li><a href="#">Marketing</a></li>
              <li><a href="#">Commerce</a></li>
              <li><a href="#">Analytics</a></li>
              <li><a href="#">Merchandise</a></li>
            </ul>
          </div>

          <div className="mx-5 mt-10">
            <p className="font-medium text-gray-500">SUPPORT</p>
            <ul className="text-sm leading-8">
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Docs</a></li>
              <li><a href="#">Audition</a></li>
              <li><a href="#">Art Status</a></li>
            </ul>
          </div>

          <div className="mx-5 mt-10">
            <p className="font-medium text-gray-500">DOCUMENTS</p>
            <ul className="text-sm leading-8">
              <li><a href="#">Terms</a></li>
              <li><a href="#">Conditions</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">License</a></li>
            </ul>
          </div>

          <div className="mx-5 mt-10">
            <p className="font-medium text-gray-500">DELIVERY</p>
            <ul className="text-sm leading-8">
              <li><a href="#">List of countries</a></li>
              <li><a href="#">Special information</a></li>
              <li><a href="#">Restrictions</a></li>
              <li><a href="#">Payment</a></li>
            </ul>
          </div>
        </div>
      </footer>
      {/* /Desktop Footer */}

      
    </div>
  );
};

export default UserFooter;
