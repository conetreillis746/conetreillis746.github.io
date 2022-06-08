<!DOCTYPE html>
<html>
    <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <script src='https://code.jquery.com/jquery-3.6.0.min.js'></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <?php $taille = "2em"; ?>
        <style>
            @media (max-width: 480px) {
                body{
                    font-size:10px;
                }
            }
            @media (min-width: 480px) and (max-width: 650px) {
                body{
                    font-size:14px;
                }
            }
            @keyframes colorSelected {
                from { color: black; }
                to { color: white; }
            }
            @keyframes colorUnselected {
                from { color: white; }
                to { color: black; }
            }
            @keyframes selected {
                from { margin: 4em; }
                to { margin: 0em; }
            }
            @keyframes unselected {
                from { margin: 0em; }
                to { margin: 4em; }
            }
            #menu{
                min-width: 4em;
                background: #bb80f1;
                color: black;
                border-top-right-radius: 1.5em;
                border-bottom-right-radius: 1.5em;
                overflow:hidden;
                border-left: 0.5em solid grey;
                min-height: max-content;
            }
            .get_icon{
                width:0px;
                position: relative;
            }
            .icon_center{
                z-index: 10;
                font-size: <?php echo $taille; ?>;
            }
            .icon_background{
                z-index: 1;
                transform: rotate(45deg);
                width: 8em;
                height: 8em;
                background-color: #67408b;
                margin: 4em;
                border-radius: <?php echo $taille; ?>;
                animation-duration: 0.5s;
            }
            .icon_to_select.selected .icon_background{
                margin: 0em;
                animation-name: selected;
            }
            .icon_to_select.unselected .icon_background{
                animation-name: unselected;
            }
            .icon_to_select{
                display: flex;
                justify-content:center;
                align-items:center;
                height: 9em;
                cursor: pointer;
            }
            .icon_to_select{
                animation-duration: 0.5s;
            }
            .icon_to_select.selected{
                color: white;
                animation-name: colorSelected;
            }
            .icon_to_select.unselected{
                animation-name: colorUnselected;
            }

            #content { flex-grow: 1; border: none; margin: 0; padding: 0; }
        </style>
        <script>
            $(document).ready(function(){
                $('.icon_to_select').click(function(){
                    url = $(this).attr('url');
                    window.location.href = url;
                    // document.getElementById('content').src = url;
                    // $('.selected').addClass('unselected').removeClass('selected');
                    // $(this).removeClass('unselected').addClass('selected');
                });
            });
        </script>
    </head>
    <?php $tab = array(
        array('icon' => "home", 'url' => "", 'default' => true),
        array('icon' => "do_not_disturb_on", 'url' => "./Demineur/index.html", "title" => "Demineur"),
        array('icon' => "person", 'url' => "./DashAttack/index.html", "title" => "DashAttack"),
        array('icon' => "cell_tower", 'url' => "./towerdefense-main/index.html", "title" => "Tower defense"),
        // array('icon' => "phone", 'url' => ""),
    ); ?>
    <body style='margin:0;display:flex'>
        <div id='menu'>
            <?php foreach($tab as $row){ ?>
            <div class='icon_to_select <?php echo ($row['default']?"selected":""); ?>' url='<?php echo $row['url']; ?>' title='<?php echo $row['title']; ?>'>
                <div class='get_icon'>
                    <div class='icon_background'></div>
                </div>
                <span class="icon_center material-icons material-icons-outlined"><?php echo $row['icon']; ?></span>
            </div>
            <?php } ?>
        </div>
        <iframe id='content'>
        </iframe>
    </body>
</html>