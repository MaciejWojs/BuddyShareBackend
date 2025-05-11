   SELECT 
                s.id AS "subscriberId", 
                s.user_id AS "userId", 
                s.streamer_id AS "streamerId", 
                ui.username AS "streamerUsername", 
                ui.profile_picture AS "profilePicture"
            FROM subscribers s
            JOIN streamers str ON s.streamer_id = str.id
            JOIN users u ON str.user_id = u.id
            JOIN users_info ui ON u.user_info_id = ui.id
            WHERE s.user_id = 1;