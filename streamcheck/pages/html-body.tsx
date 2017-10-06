import * as React from "react";

export default function HtmlBody(props) {
    return (
        <html lang="en">
            <head>
                <title>Streamcheck for Alexa</title>

                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
            </head>
            <body>
                {props.children}
            </body>
        </html>
    )
}