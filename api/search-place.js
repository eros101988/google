export default async function handler(req, res) {

    // 只允許 POST
    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        const { query } = req.body || {};


        if (
            !query ||
            typeof query !== "string" ||
            !query.trim()
        ) {

            return res.status(400).json({
                error: "請輸入商家名稱"
            });

        }


        const apiKey =
            process.env.GOOGLE_PLACES_API_KEY;


        if (!apiKey) {

            console.error(
                "GOOGLE_PLACES_API_KEY 尚未設定"
            );

            return res.status(500).json({
                error: "Google API 尚未設定"
            });

        }


        // =============================
        // Google Places API (New)
        // Text Search
        // =============================

        const googleResponse =
            await fetch(
                "https://places.googleapis.com/v1/places:searchText",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "X-Goog-Api-Key":
                            apiKey,

                        "X-Goog-FieldMask":
                            [
                                "places.id",
                                "places.displayName",
                                "places.formattedAddress",
                                "places.googleMapsLinks"
                            ].join(",")

                    },

                    body: JSON.stringify({

                        textQuery:
                            query.trim(),

                        languageCode:
                            "zh-TW",

                        regionCode:
                            "TW"

                    })

                }
            );


        const googleData =
            await googleResponse.json();


        if (!googleResponse.ok) {

            console.error(
                "Google Places API Error:",
                googleData
            );

            return res.status(
                googleResponse.status
            ).json({

                error:
                    googleData?.error?.message ||
                    "Google Places API 搜尋失敗"

            });

        }


        const places =
            (googleData.places || [])
            .slice(0, 5)
            .map(place => ({

                id:
                    place.id || "",

                name:
                    place.displayName?.text || "",

                address:
                    place.formattedAddress || "",

                writeAReviewUri:
                    place.googleMapsLinks
                    ?.writeAReviewUri || ""

            }))
            .filter(place =>
                place.writeAReviewUri
            );


        return res.status(200).json({
            places
        });


    }

    catch (error) {

        console.error(
            "Server error:",
            error
        );


        return res.status(500).json({

            error:
                "伺服器發生錯誤，請稍後再試"

        });

    }

}
