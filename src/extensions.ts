String.prototype.replaceAll = function (searchValue: string | RegExp, replaceValue: string): string {
    // Return if both values are the exact same
    if (searchValue === replaceValue) return this;

    // Save string in variable so we don't modify the original string
    let self = this; // eslint-disable-line @typescript-eslint/no-this-alias

    // Check if seachValue is a regular expression
    if (searchValue instanceof RegExp) {
        // To work the regex has to be global
        if (!searchValue.global) throw new TypeError("Regex has to be global");
        return self.replace(searchValue, replaceValue);
    }

    // Replace all values from string
    let index = self.indexOf(searchValue);
    while (index != -1) {
        self = self.replace(searchValue, replaceValue);
        index = self.indexOf(searchValue);
    }
    return self;
};
