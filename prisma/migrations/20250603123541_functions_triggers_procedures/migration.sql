
-- Usuwa przeterminowane bany (banned_until < NOW()) przed każdym nowym banem
DROP FUNCTION IF EXISTS remove_expired_bans_before_insert CASCADE;
CREATE OR REPLACE FUNCTION remove_expired_bans_before_insert() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM banned_users_per_streamer
  WHERE banned_until IS NOT NULL AND banned_until < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: automatycznie wywołuje powyższą funkcję przed każdym INSERT do banned_users_per_streamer
DROP TRIGGER IF EXISTS trg_remove_expired_bans_before_insert ON banned_users_per_streamer;
CREATE TRIGGER trg_remove_expired_bans_before_insert
BEFORE INSERT ON banned_users_per_streamer
FOR EACH ROW
EXECUTE FUNCTION remove_expired_bans_before_insert();

-- Funkcja: zwraca x najbardziej aktywnych użytkowników czatu danego streama (tylko zakończone transmisje)
DROP FUNCTION IF EXISTS get_top_chat_users_for_stream_id(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_chat_users_for_stream_id(p_stream_id INTEGER, p_limit INTEGER)
RETURNS TABLE(user_id INTEGER, username TEXT, message_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT cm.user_id, ui.username, COUNT(*)::INTEGER AS message_count
    FROM public.chat_messages cm
    JOIN public.users u ON u.id = cm.user_id
    JOIN public.users_info ui ON ui.id = u.user_info_id
    JOIN public.streams s ON s.id = cm.stream_id
    JOIN public.stream_options so ON so.id = s.options_id
    WHERE cm.stream_id = p_stream_id
      AND cm.is_deleted = FALSE
      AND so."isLive" = FALSE
    GROUP BY cm.user_id, ui.username
    ORDER BY message_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca x najbardziej aktywnych użytkowników czatu ze wszystkich zakończonych i publicznych streamów danego streamera
DROP FUNCTION IF EXISTS get_top_chat_users_for_streamer(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_chat_users_for_streamer(p_streamer_id INTEGER, p_limit INTEGER)
RETURNS TABLE(user_id INTEGER, username TEXT, message_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT cm.user_id, ui.username, COUNT(*)::INTEGER AS message_count
    FROM public.chat_messages cm
    JOIN public.users u ON u.id = cm.user_id
    JOIN public.users_info ui ON ui.id = u.user_info_id
    JOIN public.streams s ON s.id = cm.stream_id
    JOIN public.stream_options so ON so.id = s.options_id
    WHERE s.streamer_id = p_streamer_id
      AND so."isLive" = FALSE
      AND so."isDeleted" = FALSE
      AND so."isPublic" = TRUE
      AND cm.is_deleted = FALSE
    GROUP BY cm.user_id, ui.username
    ORDER BY message_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Funkcja: zwraca listę streamerów subskrybowanych przez użytkownika wraz z danymi streamera
DROP FUNCTION IF EXISTS get_streamers_subscribed_by_user CASCADE;
CREATE OR REPLACE FUNCTION get_streamers_subscribed_by_user(p_user_id INTEGER)
RETURNS TABLE(subscriber_id INTEGER, user_id INTEGER, streamer_id INTEGER, streamer_username TEXT, profile_picture TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT 
      s.id AS subscriber_id, 
      s.user_id AS user_id, 
      s.streamer_id AS streamer_id, 
      ui.username AS streamer_username, 
      ui.profile_picture AS profile_picture
    FROM subscribers s
    JOIN streamers str ON s.streamer_id = str.id
    JOIN users u ON str.user_id = u.id
    JOIN users_info ui ON u.user_info_id = ui.id
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- Funkcja: generuje raport jak często streamer streamuje (liczba streamów, daty startu i końca)
DROP FUNCTION IF EXISTS get_streaming_report_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_streaming_report_for_streamer(p_streamer_id INTEGER)
RETURNS TABLE(stream_id INTEGER, started_at TIMESTAMP, ended_at TIMESTAMP) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS stream_id, so.created_at AS started_at, so.updated_at AS ended_at
    FROM streams s
    JOIN stream_options so ON so.id = s.options_id
    WHERE s.streamer_id = p_streamer_id
    ORDER BY so.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca średnią długość streamów danego streamera
DROP FUNCTION IF EXISTS get_average_stream_duration_for_streamer(p_streamer_id INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION get_average_stream_duration_for_streamer(p_streamer_id INTEGER)
RETURNS TABLE(average_duration TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(AVG(ended_at - started_at), 'HH24:MI:SS')
  FROM get_streaming_report_for_streamer(p_streamer_id)
  WHERE ended_at IS NOT NULL AND started_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę zbanowanych użytkowników danego streamera
DROP FUNCTION IF EXISTS get_banned_users_count_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_banned_users_count_for_streamer(p_streamer_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM banned_users_per_streamer b
    JOIN streamers s ON s.id = b.streamer_id
    WHERE s.id = p_streamer_id
      AND b.banned_until IS NULL OR b.banned_until > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca liczbę moderatorów danego streamera
DROP FUNCTION IF EXISTS get_moderators_count_for_streamer CASCADE;
CREATE OR REPLACE FUNCTION get_moderators_count_for_streamer(p_streamer_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM stream_moderators sm
    JOIN streamers s ON s.id = sm.streamer_id
    WHERE s.id = p_streamer_id
  );
END;
$$ LANGUAGE plpgsql;


-- Funkcja: zwraca najbardzej followanych streamerów
DROP FUNCTION IF EXISTS get_top_followed_streamers(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_followed_streamers(p_limit INTEGER)
RETURNS TABLE(streamer_id INTEGER, username TEXT, profile_picture TEXT, followers_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS streamer_id, ui.username, ui.profile_picture, COUNT(f.follower_user_id)::INTEGER AS followers_count
    FROM streamers s
    JOIN users u ON u.id = s.user_id
    JOIN users_info ui ON ui.id = u.user_info_id
    LEFT JOIN followers f ON f.followed_user_id = u.id
    GROUP BY s.id, ui.username, ui.profile_picture
    ORDER BY followers_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funkcja: zwraca najbardzej subskrybowanych streamerów
DROP FUNCTION IF EXISTS get_top_subscribed_streamers(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_top_subscribed_streamers(p_limit INTEGER)
RETURNS TABLE(streamer_id INTEGER, username TEXT, profile_picture TEXT, subscribers_count INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT s.id AS streamer_id, ui.username, ui.profile_picture, COUNT(f.user_id)::INTEGER AS subscribers_count
    FROM streamers s
    JOIN users u ON u.id = s.user_id
    JOIN users_info ui ON ui.id = u.user_info_id
    LEFT JOIN subscribers f ON f.streamer_id = s.id
    GROUP BY s.id, ui.username, ui.profile_picture
    ORDER BY subscribers_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
