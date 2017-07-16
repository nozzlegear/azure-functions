import * as React from "react";
import Html from "./html-body";

export default function PrivacyPolicy(props) {
    /* <!DOCTYPE html> */
    return (
        <Html>
            <section>
                <h1>{`Streamcheck for Alexa: Privacy Policy`}</h1>
                <p>
                    {`The privacy of our visitors is important to us.`}
                </p>
                <p>
                    {`At Nozzlegear Software, we recognize that privacy of your personal information is important. Here is information on what types of personal information we receive and collect when you link your Amazon Alexa account with our Amazon Alexa skill, and how we safeguard your information. We never sell your personal information to third parties.`}
                </p>
                <p>
                    <strong>
                        {`Log Files`}
                    </strong>
                </p>
                <p>
                    {`As with most other websites, we collect and use the data contained in log files. The information in the log files include your IP (internet protocol) address, your ISP (internet service provider), the browser you used to visit our site (such as Internet Explorer or Firefox), the time you visited our site and which pages you visited throughout our site.`}
                </p>
                <p>
                    <strong>
                        {`Cookies, Web Beacons and Analytics`}
                    </strong>
                </p>
                <p>
                    {`We do not use any cookies, web beacons, tracking beacons, or visitor/user analytic tools.`}
                </p>
                <p>
                    <strong>
                        {`Personally Identifiable Information`}
                    </strong>
                </p>
                <p>
                    {`We do not collect or store any personal information (such as an email address, name, physical address, etc.) that could be used to identify you.`}
                </p>
            </section>
        </Html>
    )
}