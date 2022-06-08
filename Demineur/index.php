<!DOCTYPE html>
<html>
    <head>
        <script src='class.js?t=<?php echo time(); ?>'></script>
        <link href='style.css?t=<?php echo time(); ?>' rel="stylesheet"></style>
    </head>
    <body>
        <div id='zone'></div>
        <script>
            var demineur = new Demineur()

            demineur.setZone('zone')
        </script>
    </body>
</html>