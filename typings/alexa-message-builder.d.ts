declare module "alexa-message-builder" {
    class AlexaMessageBuilder {
        /**
         * Adds text that will be converted to a string understood by Alexa. Can only be called once.
         */
        addText: (text: string) => AlexaMessageBuilder;
        /**
         * Builds the message and converts it to a string that can be returned to the Alexa request.
         */
        get: () => string;
    }

    export = AlexaMessageBuilder;
}