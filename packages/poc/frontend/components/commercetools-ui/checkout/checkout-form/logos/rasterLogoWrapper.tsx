import { StaticImageData } from 'next/image';

import paypalImage from './rasterLogos/payPal.png';
import masterCardImage from './rasterLogos/masterCard.png';
import visaImage from './rasterLogos/visa.png';
import przelewy24Image from './rasterLogos/przelewy24.png';
import ppImage from './rasterLogos/PP.png';
import myBankImage from './rasterLogos/myBank.png';
import epsImage from './rasterLogos/eps.png';
import sepaImage from './rasterLogos/sepa.png';
import venmoImage from './rasterLogos/venmo.png';
import puiImage from './rasterLogos/PUI.png';
import googlePay from './rasterLogos/googlePay.png';

/*HERE ARE THE MAIN REQUIREMENTS TO THE BRAND LOGO
 *
 * if the method is not mentioned - there is either nothing mentioned in the guidelines or only a requirement to use logo from the brand page
 *
 * Venmo
 * logo - venmo
 * minimum width 40 px, minuimum space around logo v
 * minumum width - 10 px. Minimum space around = half of v width
 *
 * MasterCard
 * min size 24px. If with text - first the option
 * logo ****1234
 * where instead of stars before the number are dots has to be considered
 *
 * Visa
 * space around - at least size of the letter v in logo (height of letter for heigh of space, width for width)
 *
 * bancontact
 * never cut out text
 * horisontal logo (text on the right side) - min width 115 px on screen,
 * min white space around 1.5 letter B height on white bg, and 3 times larger on colored
 *
 * przelewy24 - absolutely no requirements, provide 2 versions of logo - przelewy24 and p24. Selected przelewy because
 * 1) they use on own pages only this
 * 2) avoid confusion with other p24 (privat24 is one of the two main methods in Ukraine)
 *
 * BLIK - absolutely confusing guide somewhere inside a pdf at
 * https://blik.com/en/download/pobierz/recommendations-for-merchants,
 * I guess from it that:
 *  - either no text near
 *  - ot text at the left
 *  - or no logo if all other methods have no text
 * the icon was taken from https://developer.paypal.com/beta/apm-beta/additional-information/method-icons/
 * it looks same as official but has more readable svg
 *
 * Giropay - https://www.giropay.de/dA/86059f069f/giropay_styleguide_extern.pdf
 *  approx double height of letter o around at all sides unless it is a button similar to other buttons
 * text on the logo can't be taken away
 *
 * MyBank - https://mybank.eu/download/MyBank%20-%20Merchants%20guide.pdf
 * main rules:
 * - similar to other methods:
 * - wherever other methods are presented
 *
 * EPS - taken from official page https://eps-ueberweisung.at/de/download/eps-ueberweisung-dokumentation
 * alternative svg can be found at paypal local methods https://developer.paypal.com/beta/apm-beta/additional-information/method-icons/
 *
 * Grub - taken from official page https://www.grab.com/sg/pressdownload/
 * alternative svg (probably old before rebranding) can be found at paypal local methods https://developer.paypal.com/beta/apm-beta/additional-information/method-icons/
 *
 * Ideal- taken from official page https://www.ideal.nl/en/businesses/logos/
 * same svg can be found at paypal local methods https://developer.paypal.com/beta/apm-beta/additional-information/method-icons/
 *
 * Sepa - always with text, can use official translation, https://www.europeanpaymentscouncil.eu/document-library/other/sepa-logo-vector-format
 * the rest - standard things like do not modify/add shadow/place at the bg where it can't be seen...
 *
 * */

const LOGO_STYLE = 'mr-3 object-contain h-full';
const LOGO_NEEDS_SPACE_STYLE = `p-1 -ml-1 ${LOGO_STYLE}`;
const LOGO_NEEDS_LARGE_SPACE_STYLE = `p-2 -ml-2 ${LOGO_STYLE}`;

type ImageData = {
  image: StaticImageData;
  paymentType: string;
  logoClass?: string;
  textAfter?: string;
};

const logoImages = {
  paypalRadiobutton: [{ image: paypalImage, logoClass: LOGO_NEEDS_SPACE_STYLE }],
  cardFieldsRadiobutton: [{ image: masterCardImage }, { image: visaImage, logoClass: LOGO_NEEDS_LARGE_SPACE_STYLE }],
  p24Radiobutton: [{ image: przelewy24Image }],
  paylaterRadiobutton: [{ image: ppImage, logoClass: LOGO_NEEDS_SPACE_STYLE, textAfter: 'Pay Later' }],
  mybankRadiobutton: [{ image: myBankImage }],
  epsRadiobutton: [{ image: epsImage }],
  sepaRadiobutton: [{ image: sepaImage }],
  venmoRadiobutton: [{ image: venmoImage, logoClass: LOGO_NEEDS_LARGE_SPACE_STYLE }],
  PayPalInvoiceRadiobutton: [{ image: puiImage, logoClass: LOGO_STYLE }],
  googlePayRadiobutton: [{ image: googlePay }],
};

const ImageEntry = ({ image, paymentType, logoClass, textAfter }: ImageData) => {
  return (
    <>
      <img src={image.src} alt={paymentType} className={logoClass ?? LOGO_STYLE} />
      {textAfter && <span className="my-auto -mx-3">{textAfter} </span>}
    </>
  );
};
export const rasterLogoWrapper = (paymentType: string) => {
  const existingImages = logoImages[paymentType];
  return existingImages ? (
    <>
      {existingImages.map((imageData: ImageData, index: number) => (
        <ImageEntry key={index} {...imageData} paymentType={paymentType} />
      ))}
    </>
  ) : null;
};
