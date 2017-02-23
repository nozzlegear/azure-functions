import * as React from "react";
import Html from "./html-body";

export interface IProps extends React.Props<React.StatelessComponent<IProps>> {
    target_url: string;
}

const STYLES = {
    section: {
        margin: `40px`,
        padding: `40px`,
        background: `#cceaf3`,
        color: `#333`,
        fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
    } as React.CSSProperties,
    p: {

    } as React.CSSProperties,
    buttonContainer: {
        padding: `36px 0 20px`,
    } as React.CSSProperties,
    button: {
        fontSize: `16px`,
        padding: `5px 10px`,
        color: `#fff`,
        backgroundColor: `#0078d7`,
        borderColor: `transparent`,
        margin: `0`,
        minWidth: `120px`,
        //-webkit-appearance: `none`,
        borderStyle: `solid`,
        borderWidth: `2px`,
        backgroundClip: `border-box`,
        borderRadius: 0,
        fontWeight: 400,
        lineHeight: `1.333`,
        touchAction: `manipulation`,
        cursor: `pointer`,
        textTransform: `none`,
        overflow: `visible`,
        textDecoration: `none`,
        textAlign: `center`,
    } as React.CSSProperties,
    header: {
        marginTop: 0
    } as React.CSSProperties
}

export default function StreamcheckIndex(props: IProps) {
    /* <!DOCTYPE html> */
    return (
        <Html>
            <section style={STYLES.section}>
                <h1 style={STYLES.header}>{`One last step: connect your Twitch account!`}</h1>
                <p style={STYLES.p}>
                    {`Thanks for trying out `}
                    <strong>
                        {`Streamcheck for Alexa! `}
                    </strong>
                    {`Before you can use this skill, we need you to authenticate with your Twitch account.`}
                </p>
                <p style={STYLES.p}>
                    {`We'll need to ask you for `}
                    <strong>
                        {`read-only user access `}
                    </strong>
                    {`to your Twitch account, so Alexa can know which streamers you're following.`}
                </p>
                <p style={STYLES.p}>
                    {`By default, this access let's this skill see your email address, but `}
                    <strong>
                        {`we do not store or use your email address at all.`}
                    </strong>
                </p>
                <div style={STYLES.buttonContainer}>
                    <a style={STYLES.button} href={props.target_url}>
                        {`Connect with Twitch`}
                    </a>
                </div>
                <p style={STYLES.p}>
                    <small>
                        {`Your privacy is important to us. `}
                        <a href={`/streamcheck/privacy-policy`} target={`_blank`}>
                            {`You can read our privacy policy here.`}
                        </a>
                    </small>
                </p>
            </section>
        </Html>
    )
}