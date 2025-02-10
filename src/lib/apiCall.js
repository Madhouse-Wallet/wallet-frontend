export const getUser = async (email) => {
    try {
        try {
            // console.log(email)
            return await fetch(`/api/get-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};


export const updtUser = async (findData, updtData) => {
    try {
        try {
            console.log("email", findData, updtData)
            return await fetch(`/api/updt-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    findData,
                    updtData
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};